import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useEffect
} from 'react';
import { exportSVG } from '../utils/svgExport';
import styles from './DrawNodeArtboard.module.css';

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
  color: string;
  strokeWidth: number;
  opacity: number;
  blendMode: string;
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
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const [artboardSize, setArtboardSize] = useState({ width, height });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

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
    window.dispatchEvent(
      new CustomEvent('content-updated', {
        detail: { content: newContent }
      })
    );

    // Log SVG drawing
    console.log('DrawNodeArtboard SVG Drawing:', exportSVG(canvas));
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
    if (!context || !canvas) return;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    const newContent = canvas.toDataURL() || '';
    handleContentChange(newContent);
    window.dispatchEvent(
      new CustomEvent('content-updated', { detail: { content: newContent } })
    );

    // Log cleared SVG
    console.log('DrawNodeArtboardCleared SVG:', exportSVG(canvas));
  }, [context, canvas, handleContentChange]);

  const gotRef = useCallback(
    (canvasRef: HTMLCanvasElement | null) => {
      if (!canvasRef) return;
      const aspectRatio = 16 / 9;
      const canvasWidth = artboardSize.width * 0.8;
      const canvasHeight = canvasWidth / aspectRatio;
      canvasRef.width = canvasWidth;
      canvasRef.height = canvasHeight;
      setCanvasSize({ width: canvasWidth, height: canvasHeight });
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
          // Log initial SVG
          console.log('DrawNodeArtboardInitial SVG:', exportSVG(canvasRef));
        };
        image.src = content;
      }
    },
    [artboardSize, content]
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
          // Log redrawn SVG
          console.log('Redrawn SVG:', exportSVG(canvas));
        }
      };
      image.src = content;
    }
  }, [context, canvas, content]);

  const handleResize = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, direction: string) => {
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = artboardSize.width;
      const startHeight = artboardSize.height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (direction === 'left' || direction === 'right') {
          const newWidth =
            startWidth + (direction === 'right' ? deltaX : -deltaX);
          setArtboardSize((prevSize) => ({ ...prevSize, width: newWidth }));
        } else if (direction === 'top' || direction === 'bottom') {
          const newHeight =
            startHeight + (direction === 'bottom' ? deltaY : -deltaY);
          setArtboardSize((prevSize) => ({ ...prevSize, height: newHeight }));
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [artboardSize]
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
    <div className={styles.artboardContainer}>
      <div
        className={styles.artboardWrapper}
        style={{ width: artboardSize.width, height: artboardSize.height }}
      >
        <div className={styles.canvasWrapper}>
          <canvas
            className={styles.canvas}
            style={{
              cursor: tool?.cursor,
              touchAction: 'none',
              ...style,
              width: canvasSize.width,
              height: canvasSize.height
            }}
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
        </div>
        <div
          className={`${styles.resizeHandle} ${styles.top}`}
          onMouseDown={(event) => handleResize(event, 'top')}
        />
        <div
          className={`${styles.resizeHandle} ${styles.right}`}
          onMouseDown={(event) => handleResize(event, 'right')}
        />
        <div
          className={`${styles.resizeHandle} ${styles.bottom}`}
          onMouseDown={(event) => handleResize(event, 'bottom')}
        />
        <div
          className={`${styles.resizeHandle} ${styles.left}`}
          onMouseDown={(event) => handleResize(event, 'left')}
        />
      </div>
    </div>
  );
});

export default Artboard;
