import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useEffect,
  useRef
} from 'react';

import { History } from '@/ui/nodes/drawNode/drawNodeHistory';

import {
  getMousePoint,
  getTouchPoint,
  mouseButtonIsDown,
  Point
} from '@/ui/nodes/drawNode/utils/pointUtils';

export interface ArtboardProps
  extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  tool: ToolHandlers;
  history?: History;
  onStartStroke?: (point: Point) => void;
  onContinueStroke?: (point: Point) => void;
  onEndStroke?: () => void;
  content?: string;
  onContentChange?: (newContent: string) => void;
  width: number;
  height: number;
  onResize?: () => void;
}

export interface ArtboardRef {
  download: (filename?: string, type?: string) => void;
  getImageAsDataUri: (type?: string) => string | undefined;
  clear: () => void;
  context?: CanvasRenderingContext2D | null;
  width: number;
  height: number;
}

export interface ToolHandlers {
  name: string;
  startStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
  continueStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
  endStroke?: (context: CanvasRenderingContext2D) => void;
  cursor?: string;
}

export const Artboard = forwardRef(function Artboard(
  {
    tool,
    style,
    history,
    onStartStroke,
    onContinueStroke,
    onEndStroke,
    content,
    onContentChange,
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [drawing, setDrawing] = useState(false);
  const artboardInstance = useRef<ArtboardRef>(null);
  const [prevContent, setPrevContent] = useState<string | undefined>(content);

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
      if (canvas && history) {
        history.pushState(canvas);
      }
      if (onContentChange) {
        onContentChange(canvas?.toDataURL() || '');
      }
    }
  }, [tool, context, canvas, history, onEndStroke, onContentChange]);

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
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
    if (canvas && history) {
      history.pushState(canvas);
    }
    if (onContentChange) {
      onContentChange(canvas?.toDataURL() || '');
    }
  }, [context, canvas, history, onContentChange]);

  const gotRef = useCallback(
    (canvasRef: HTMLCanvasElement) => {
      if (!canvasRef) {
        return;
      }
      const aspectRatio = 16 / 9;
      const canvasSize = Math.min(props.width, props.height);
      canvasRef.width = canvasSize * aspectRatio;
      canvasRef.height = canvasSize;
      const ctx = canvasRef.getContext('2d');
      setCanvas(canvasRef);
      setContext(ctx);
      if (!ctx) {
        return;
      }
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
      if (history) {
        history.setContext(ctx);
        history.pushState(canvasRef);
      }
    },
    [props.width, props.height, content, history]
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
      clear,
      getImageAsDataUri: (type?: string) => canvas?.toDataURL(type),
      context,
      width: canvas?.width || 0,
      height: canvas?.height || 0
    }),
    [canvas, context, clear]
  );

  useEffect(() => {
    if (props.onResize) {
      props.onResize();
    }
    if (canvas && context) {
      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = prevContent || '';
    }
  }, [props.width, props.height, props.onResize, canvas, context, prevContent]);

  useEffect(() => {
    if (onContentChange) {
      onContentChange(canvas?.toDataURL() || '');
    }
  }, [canvas, onContentChange]);

  useEffect(() => {
    if (content) {
      const artboardRef = artboardInstance.current;
      if (artboardRef) {
        const ctx = artboardRef.context;
        if (ctx) {
          const image = new Image();
          image.onload = () => {
            ctx.clearRect(0, 0, artboardRef.width, artboardRef.height); // Clear the canvas before drawing
            ctx.drawImage(image, 0, 0, artboardRef.width, artboardRef.height);
          };
          image.src = content;
        }
      }
    }
    setPrevContent(content);
  }, [content]);

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
