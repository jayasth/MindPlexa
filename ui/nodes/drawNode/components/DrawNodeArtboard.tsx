import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useEffect
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
  onLayerChange?: (layers: Layer[]) => void;
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
    onLayerChange,
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const { history } = useHistory();

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange]
  );

  const setupStroke = useCallback(() => {
    if (!context) return;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
    context.globalAlpha = opacity / 100;
    context.globalCompositeOperation = blendMode as GlobalCompositeOperation;
  }, [context, color, strokeWidth, opacity, blendMode]);

  const startStroke = useCallback(
    (point: Point) => {
      if (!context) return;
      setupStroke();
      setDrawing(true);
      tool.startStroke?.(point, context);
      onStartStroke?.(point);
    },
    [tool, context, onStartStroke, setupStroke]
  );

  const continueStroke = useCallback(
    (newPoint: Point) => {
      if (!context) return;
      setupStroke();
      tool.continueStroke?.(newPoint, context);
      onContinueStroke?.(newPoint);
    },
    [tool, context, onContinueStroke, setupStroke]
  );

  const endStroke = useCallback(() => {
    if (!context || !canvas) return;
    setDrawing(false);
    tool.endStroke?.(context);
    onEndStroke?.();
    context.restore();
    const newContent = canvas.toDataURL() || '';
    handleContentChange(newContent);
    history.pushState(canvas);
    window.dispatchEvent(
      new CustomEvent('content-updated', {
        detail: { content: newContent }
      })
    );

    console.log(
      'DrawNodeArtboard SVG Drawing:',
      canvas ? exportSVG(canvas) : ''
    );
  }, [tool, context, canvas, onEndStroke, handleContentChange, history]);

  const mouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!drawing) {
        return;
      }
      continueStroke(getMousePoint(event));
    },
    [continueStroke, drawing]
  );

  const touchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!drawing) {
        return;
      }
      continueStroke(getTouchPoint(event));
    },
    [continueStroke, drawing]
  );

  const mouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (drawing) {
        return;
      }
      event.preventDefault();
      startStroke(getMousePoint(event));
    },
    [drawing, startStroke]
  );

  const touchStart = useCallback(
    (event: React.TouchEvent) => {
      if (drawing) {
        return;
      }
      startStroke(getTouchPoint(event));
    },
    [drawing, startStroke]
  );

  const clear = useCallback(() => {
    if (!context || !canvas) return;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    const newContent = canvas.toDataURL() || '';
    handleContentChange(newContent);
    history.clear();
    window.dispatchEvent(
      new CustomEvent('content-updated', { detail: { content: newContent } })
    );

    console.log(
      'DrawNodeArtboardCleared SVG:',
      canvas ? exportSVG(canvas) : ''
    );
  }, [context, canvas, handleContentChange, history]);

  const gotRef = useCallback(
    (canvasRef: HTMLCanvasElement | null) => {
      if (!canvasRef) return;
      const aspectRatio = 16 / 9;
      const canvasSize = Math.min(width, height);
      canvasRef.width = canvasSize * aspectRatio;
      canvasRef.height = canvasSize;
      const ctx = canvasRef.getContext('2d');
      setCanvas(canvasRef);

      if (!ctx) {
        console.error('Failed to get 2D context');
        return;
      }
      setContext(ctx);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
      ctx.fillStyle = 'transparent';
      ctx.scale(zoomLevel, zoomLevel);
      if (content) {
        const image = new Image();
        image.onload = () => {
          ctx.drawImage(image, 0, 0, canvasRef.width, canvasRef.height);
          console.log(
            'DrawNodeArtboardInitial SVG:',
            canvasRef ? exportSVG(canvasRef) : ''
          );
        };
        image.src = content;
      }
    },
    [width, height, content, zoomLevel]
  );

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
      if (!drawing) {
        return;
      }
      continueStroke(getMousePoint(event));
      endStroke();
    },
    [continueStroke, drawing, endStroke]
  );

  const redrawCanvas = useCallback(() => {
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (content) {
      const image = new Image();
      image.onload = () => {
        if (context && canvas) {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          console.log('Redrawn SVG:', canvas ? exportSVG(canvas) : '');
        }
      };
      image.src = content;
    }
  }, [context, canvas, content]);

  const drawLayers = useCallback(() => {
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((layer) => {
      if (layer.visible) {
        // Draw layer content here
        // You'll need to store and retrieve layer-specific drawing data
      }
    });
  }, [context, canvas, layers]);

  useEffect(() => {
    drawLayers();
  }, [drawLayers, layers]);

  const handleDrawingChange = useCallback(
    async (newDrawingData: string) => {
      const svgContent = canvas ? exportSVG(canvas) : '';
      onContentChange?.(svgContent);
      // Update the active layer's content
      const updatedLayers = layers.map((layer) =>
        layer.id === activeLayerId ? { ...layer, content: svgContent } : layer
      );
      onLayerChange?.(updatedLayers);
    },
    [canvas, onContentChange, layers, activeLayerId, onLayerChange]
  );

  useEffect(() => {
    if (context) {
      history.setContext(context);
    }
  }, [context, history]);

  useImperativeHandle(
    ref,
    () => ({
      download: (filename = 'image.png', type?: string) => {
        if (!canvas) {
          return;
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL(type);
        a.download = filename;
        a.click();
      },
      getImageAsDataUri: (type?: string) =>
        canvas ? canvas.toDataURL(type) : undefined,
      getImageAsSVG: () => (canvas ? exportSVG(canvas) : ''),
      clear,
      context,
      width: canvas ? canvas.width : 0,
      height: canvas ? canvas.height : 0,
      canvas: canvas as HTMLCanvasElement
    }),
    [canvas, context, clear]
  );

  return (
    <canvas
      style={{ cursor: tool?.cursor, touchAction: 'none', ...style }}
      onTouchStart={touchStart}
      onMouseDown={(e) => {
        if (activeLayerId) {
          mouseDown(e);
        }
      }}
      onMouseEnter={mouseEnter}
      onMouseMove={drawing ? mouseMove : undefined}
      onTouchMove={drawing ? touchMove : undefined}
      onMouseUp={endStroke}
      onMouseOut={mouseLeave}
      onTouchEnd={endStroke}
      ref={gotRef}
      {...props}
    />
  );
});

export default Artboard;
