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
import { ToolSetting } from '../types';
import { ToolHandlers } from '../DrawNodeTools';

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
  settings: ToolSetting[];
  toolSettings: any[];
  currentToolIndex: number;
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
    settings,
    toolSettings,
    currentToolIndex,
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const { history } = useHistory();

  const currentToolSetting = toolSettings[currentToolIndex];

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
    context.strokeStyle = currentToolSetting.color;
    context.lineWidth = currentToolSetting.strokeWidth;
    context.globalAlpha = currentToolSetting.opacity / 100;
    context.globalCompositeOperation =
      currentToolSetting.blendMode as GlobalCompositeOperation;
  }, [context, currentToolSetting]);

  const startStroke = useCallback(
    (point: Point) => {
      if (!context) return;
      setupStroke();
      setDrawing(true);
      const settings: ToolSetting = {
        name: tool.name,
        color,
        strokeWidth,
        opacity,
        blendMode
      };
      tool.startStroke?.(point, context, settings);
      onStartStroke?.(point);
    },
    [
      tool,
      context,
      onStartStroke,
      setupStroke,
      color,
      strokeWidth,
      opacity,
      blendMode
    ]
  );

  const continueStroke = useCallback(
    (newPoint: Point) => {
      if (!context) return;
      setupStroke();
      const settings: ToolSetting = {
        name: tool.name,
        color,
        strokeWidth,
        opacity,
        blendMode
      };
      tool.continueStroke?.(newPoint, context, settings);
      onContinueStroke?.(newPoint);
    },
    [
      tool,
      context,
      onContinueStroke,
      setupStroke,
      color,
      strokeWidth,
      opacity,
      blendMode
    ]
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
      onMouseDown={mouseDown}
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
