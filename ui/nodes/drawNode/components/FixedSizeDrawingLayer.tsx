import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useEffect,
  useState
} from 'react';
import { ToolHandlers } from '../DrawNodeTools';
import {
  Point,
  getMousePoint,
  getTouchPoint
} from '@/ui/nodes/drawNode/utils/pointUtils';
import { ToolSetting } from '../types';
import { useHistory } from '../drawNodeHistory';
import { exportSVG } from '../utils/svgExport';
import { circleCursor } from '../utils/cursors';

interface FixedSizeDrawingLayerProps {
  width: number;
  height: number;
  tool: ToolHandlers;
  color: string;
  strokeWidth: number;
  opacity: number;
  onContentChange: (newContent: string) => void;
  content?: string;
}

export interface FixedSizeDrawingLayerRef {
  clear: () => void;
  getImageAsDataUri: (type?: string) => string | undefined;
  getImageAsSVG: () => string;
  canvas: HTMLCanvasElement | null;
  loadContent: (content: string) => void;
}

const FixedSizeDrawingLayer = forwardRef<
  FixedSizeDrawingLayerRef,
  FixedSizeDrawingLayerProps
>(
  (
    {
      width,
      height,
      tool,
      color,
      strokeWidth,
      opacity,
      onContentChange,
      content
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(
      null
    );
    const [drawing, setDrawing] = useState(false);
    const { history } = useHistory();

    useEffect(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          setContext(ctx);
          history.setContext(ctx);
        }
      }
    }, [history]);

    useEffect(() => {
      if (content && context && canvasRef.current) {
        const image = new Image();
        image.onload = () => {
          context.clearRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
        };
        image.src = content;
      }
    }, [content, context, width, height]);

    const setupStroke = useCallback(() => {
      if (!context) return;
      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
      context.globalAlpha = opacity / 100;
    }, [context, color, strokeWidth, opacity]);

    const startStroke = useCallback(
      (point: Point) => {
        if (!context) return;
        setupStroke();
        setDrawing(true);
        const settings: ToolSetting = {
          name: tool.name,
          color,
          strokeWidth,
          opacity
        };
        tool.startStroke?.(point, context, settings);
      },
      [context, setupStroke, tool, color, strokeWidth, opacity]
    );

    const continueStroke = useCallback(
      (point: Point) => {
        if (!context || !drawing) return;
        setupStroke();
        const settings: ToolSetting = {
          name: tool.name,
          color,
          strokeWidth,
          opacity
        };
        tool.continueStroke?.(point, context, settings);
      },
      [context, drawing, setupStroke, tool, color, strokeWidth, opacity]
    );

    const endStroke = useCallback(() => {
      if (!context || !canvasRef.current) return;
      setDrawing(false);
      tool.endStroke?.(context);
      context.globalAlpha = 1;
      const svgDataUrl = exportSVG(canvasRef.current);
      onContentChange(svgDataUrl);
      history.pushState(canvasRef.current);
    }, [context, tool, onContentChange, history]);

    const handleMouseDown = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        startStroke(getMousePoint(event));
      },
      [startStroke]
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (drawing) {
          continueStroke(getMousePoint(event));
        }
      },
      [drawing, continueStroke]
    );

    const handleMouseUp = useCallback(() => {
      endStroke();
    }, [endStroke]);

    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLCanvasElement>) => {
        startStroke(getTouchPoint(event));
      },
      [startStroke]
    );

    const handleTouchMove = useCallback(
      (event: React.TouchEvent<HTMLCanvasElement>) => {
        if (drawing) {
          continueStroke(getTouchPoint(event));
        }
      },
      [drawing, continueStroke]
    );

    const handleTouchEnd = useCallback(() => {
      endStroke();
    }, [endStroke]);

    const clear = useCallback(() => {
      if (context && canvasRef.current) {
        context.clearRect(0, 0, width, height);
        onContentChange(canvasRef.current.toDataURL());
        history.clear();
      }
    }, [context, width, height, onContentChange, history]);

    useImperativeHandle(ref, () => ({
      clear,
      getImageAsDataUri: (type?: string) => canvasRef.current?.toDataURL(type),
      getImageAsSVG: () =>
        canvasRef.current ? exportSVG(canvasRef.current) : '',
      canvas: canvasRef.current,
      loadContent: (content: string) => {
        if (context && canvasRef.current) {
          const image = new Image();
          image.onload = () => {
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            history.pushState(canvasRef.current!);
          };
          image.src = content;
        }
      }
    }));

    const getCursor = useCallback(() => {
      if (tool.cursor) {
        return typeof tool.cursor === 'function'
          ? tool.cursor(strokeWidth)
          : tool.cursor;
      }
      return circleCursor(strokeWidth);
    }, [tool, strokeWidth]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ touchAction: 'none', cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    );
  }
);

FixedSizeDrawingLayer.displayName = 'FixedSizeDrawingLayer';

export default FixedSizeDrawingLayer;
