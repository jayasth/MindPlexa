import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useEffect,
  useRef
} from 'react';
import { exportSVG } from '../utils/svgExport';
import { useHistory } from '../drawNodeHistory';
import {
  getMousePoint,
  getTouchPoint,
  mouseButtonIsDown,
  Point
} from '@/ui/nodes/drawNode/utils/pointUtils';
import { Layer } from '../types';

export interface ArtboardProps
  extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  tool: ToolHandlers;
  onStartStroke?: (point: Point) => void;
  onContinueStroke?: (point: Point) => void;
  onEndStroke?: () => void;
  content?: string;
  onContentChange?: (newContent: string) => void;
  width: number;
  height: number;
  onResize?: () => void;
  zoomLevel: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  blendMode: string;
  layers: Layer[];
  activeLayerId: string;
}

export interface ToolHandlers {
  name: string;
  startStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
  continueStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
  endStroke?: (context: CanvasRenderingContext2D) => void;
  cursor?: string;
}

export interface ArtboardRef {
  download: (filename?: string, type?: string) => void;
  getImageAsDataUri: (type?: string) => string | undefined;
  getImageAsSVG: () => string;
  clear: () => void;
  context?: CanvasRenderingContext2D | null;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
}

export const Artboard = forwardRef(function Artboard(
  {
    tool,
    style,
    onStartStroke,
    onContinueStroke,
    onEndStroke,
    content: initialContent,
    onContentChange,
    width,
    height,
    onResize,
    zoomLevel,
    color,
    strokeWidth,
    opacity,
    blendMode,
    layers,
    activeLayerId,
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [canvasLayers, setCanvasLayers] = useState<{
    [key: string]: HTMLCanvasElement;
  }>({});
  const [drawing, setDrawing] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const { history } = useHistory();
  const containerRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const newCanvasLayers: { [key: string]: HTMLCanvasElement } = {};
    layers.forEach((layer) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.display = layer.visible ? 'block' : 'none';
      newCanvasLayers[layer.id] = canvas;
    });
    setCanvasLayers(newCanvasLayers);
  }, [layers, width, height]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      Object.values(canvasLayers).forEach((canvas) => {
        containerRef.current?.appendChild(canvas);
      });
    }
  }, [canvasLayers]);

  const getActiveCanvas = useCallback(() => {
    return canvasLayers[activeLayerId];
  }, [canvasLayers, activeLayerId]);

  const getActiveContext = useCallback(() => {
    const canvas = getActiveCanvas();
    return canvas ? canvas.getContext('2d') : null;
  }, [getActiveCanvas]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange]
  );

  const setupStroke = useCallback(() => {
    const context = getActiveContext();
    if (!context) return;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
    context.globalAlpha = opacity / 100;
    context.globalCompositeOperation = blendMode as GlobalCompositeOperation;
  }, [getActiveContext, color, strokeWidth, opacity, blendMode]);

  const startStroke = useCallback(
    (point: Point) => {
      const context = getActiveContext();
      if (!context) return;
      setupStroke();
      setDrawing(true);
      tool.startStroke?.(point, context);
      onStartStroke?.(point);
    },
    [tool, getActiveContext, onStartStroke, setupStroke]
  );

  const continueStroke = useCallback(
    (newPoint: Point) => {
      const context = getActiveContext();
      if (!context) return;
      setupStroke();
      tool.continueStroke?.(newPoint, context);
      onContinueStroke?.(newPoint);
    },
    [tool, getActiveContext, onContinueStroke, setupStroke]
  );

  const endStroke = useCallback(() => {
    const context = getActiveContext();
    const canvas = getActiveCanvas();
    if (!context || !canvas) return;
    setDrawing(false);
    tool.endStroke?.(context);
    onEndStroke?.();
    context.restore();
    const newContent = compositeLayersToDataURL();
    handleContentChange(newContent);
    history.pushState(canvas);
    window.dispatchEvent(
      new CustomEvent('content-updated', {
        detail: { content: newContent }
      })
    );
  }, [
    tool,
    getActiveContext,
    getActiveCanvas,
    onEndStroke,
    handleContentChange,
    history
  ]);

  const mouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!drawing) return;
      continueStroke(getMousePoint(event));
    },
    [continueStroke, drawing]
  );

  const touchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (!drawing) return;
      continueStroke(getTouchPoint(event));
    },
    [continueStroke, drawing]
  );

  const mouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (drawing) return;
      event.preventDefault();
      startStroke(getMousePoint(event));
    },
    [drawing, startStroke]
  );

  const touchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (drawing) return;
      startStroke(getTouchPoint(event));
    },
    [drawing, startStroke]
  );

  const clear = useCallback(() => {
    Object.values(canvasLayers).forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    });
    const newContent = compositeLayersToDataURL();
    handleContentChange(newContent);
    history.clear();
    window.dispatchEvent(
      new CustomEvent('content-updated', { detail: { content: newContent } })
    );
  }, [canvasLayers, handleContentChange, history]);

  const compositeLayersToDataURL = useCallback(() => {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = width;
    compositeCanvas.height = height;
    const ctx = compositeCanvas.getContext('2d');
    if (ctx) {
      layers.forEach((layer) => {
        if (layer.visible) {
          ctx.drawImage(canvasLayers[layer.id], 0, 0);
        }
      });
    }
    return compositeCanvas.toDataURL();
  }, [canvasLayers, layers, width, height]);

  const mouseEnter = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (mouseButtonIsDown(event.buttons)) {
        mouseDown(event);
      } else if (drawing) {
        endStroke();
      }
    },
    [drawing, mouseDown, endStroke]
  );

  const mouseLeave = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!drawing) return;
      continueStroke(getMousePoint(event));
      endStroke();
    },
    [continueStroke, drawing, endStroke]
  );

  useImperativeHandle(
    ref,
    () => ({
      download: (filename = 'image.png', type?: string) => {
        const dataUrl = compositeLayersToDataURL();
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.click();
      },
      getImageAsDataUri: compositeLayersToDataURL,
      getImageAsSVG: () => exportSVG(getActiveCanvas()),
      clear,
      context: getActiveContext(),
      width,
      height,
      canvas: getActiveCanvas()
    }),
    [
      compositeLayersToDataURL,
      getActiveCanvas,
      getActiveContext,
      clear,
      width,
      height
    ]
  );

  return (
    <canvas
      ref={containerRef}
      style={{
        ...style,
        position: 'relative',
        width,
        height,
        cursor: tool?.cursor,
        touchAction: 'none'
      }}
      onTouchStart={touchStart}
      onMouseDown={mouseDown}
      onMouseEnter={mouseEnter}
      onMouseMove={drawing ? mouseMove : undefined}
      onTouchMove={drawing ? touchMove : undefined}
      onMouseUp={endStroke}
      onMouseOut={mouseLeave}
      onTouchEnd={endStroke}
      {...props}
    />
  );
});

export default Artboard;
