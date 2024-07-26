import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useEffect
} from 'react';
import { exportSVG } from '../utils/svgExport';

import {
  getMousePoint,
  getTouchPoint,
  mouseButtonIsDown,
  Point
} from '@/ui/nodes/drawNode/utils/pointUtils';

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
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [drawing, setDrawing] = useState(false);
  const [content, setContent] = useState(initialContent || '');

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange]
  );

  const startStroke = useCallback(
    (point: Point) => {
      if (!context) {
        return;
      }
      context.save();
      setDrawing(true);
      tool.startStroke?.(point, context);
      onStartStroke?.(point);
    },
    [tool, context, onStartStroke]
  );

  const continueStroke = useCallback(
    (newPoint: Point) => {
      if (!context) {
        return;
      }
      tool.continueStroke?.(newPoint, context);
      onContinueStroke?.(newPoint);
    },
    [tool, context, onContinueStroke]
  );

  const endStroke = useCallback(() => {
    setDrawing(false);
    if (context) {
      tool.endStroke?.(context);
      onEndStroke?.();
      context.restore();
      if (canvas) {
        const newContent = canvas.toDataURL() || '';
        handleContentChange(newContent);
        window.dispatchEvent(
          new CustomEvent('content-updated', {
            detail: { content: newContent }
          })
        );
      }
    }
  }, [tool, context, canvas, onEndStroke, handleContentChange]);

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
    if (!context || !canvas) {
      return;
    }
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    const newContent = canvas.toDataURL() || '';
    handleContentChange(newContent);
    window.dispatchEvent(
      new CustomEvent('content-updated', { detail: { content: newContent } })
    );
  }, [context, canvas, handleContentChange]);

  const gotRef = useCallback(
    (canvasRef: HTMLCanvasElement) => {
      if (!canvasRef) {
        return;
      }
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
      if (content) {
        const image = new Image();
        image.onload = () => {
          ctx.drawImage(image, 0, 0, canvasRef.width, canvasRef.height);
        };
        image.src = content;
      }
    },
    [width, height, content]
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

  useEffect(() => {
    if (context && canvas) {
      context.setTransform(zoomLevel, 0, 0, zoomLevel, 0, 0);
      redrawCanvas();
    }
  }, [zoomLevel, context, canvas]);

  const redrawCanvas = useCallback(() => {
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (content) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = content;
    }
  }, [context, canvas, content]);

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
      getImageAsSVG: () => exportSVG(canvas),
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
