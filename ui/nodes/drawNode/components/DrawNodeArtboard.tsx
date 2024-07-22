import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useEffect
} from 'react';

import { History } from '@/ui/nodes/drawNode/drawNodeHistory';
import { Layer } from '../types';

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
  layers: Layer[];
  activeLayerId: string;
  zoom: number;
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
    width,
    height,
    onResize,
    layers,
    activeLayerId,
    zoom,
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [drawing, setDrawing] = useState(false);
  const [layerContexts, setLayerContexts] = useState<{
    [key: string]: CanvasRenderingContext2D;
  }>({});
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!canvas) return;

    const newLayerContexts: { [key: string]: CanvasRenderingContext2D } = {};
    layers.forEach((layer) => {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = canvas.width;
      layerCanvas.height = canvas.height;
      const layerContext = layerCanvas.getContext('2d');
      if (layerContext) {
        newLayerContexts[layer.id] = layerContext;
      }
    });
    setLayerContexts(newLayerContexts);
  }, [layers, canvas]);

  useEffect(() => {
    setZoomLevel(zoom);
  }, [zoom]);

  const composeLayers = useCallback(() => {
    if (!context || !canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.scale(zoomLevel, zoomLevel);
    layers.forEach((layer) => {
      if (layer.visible) {
        const layerContext = layerContexts[layer.id];
        if (layerContext) {
          context.drawImage(layerContext.canvas, 0, 0);
        }
      }
    });
    context.restore();
  }, [context, canvas, layers, layerContexts, zoomLevel]);

  useEffect(() => {
    composeLayers();
  }, [composeLayers]);

  const getAdjustedPoint = useCallback(
    (point: Point): Point => {
      if (!canvas) return point;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return [(point[0] * scaleX) / zoomLevel, (point[1] * scaleY) / zoomLevel];
    },
    [canvas, zoomLevel]
  );

  const startStroke = useCallback(
    (point: Point) => {
      const activeLayerContext = layerContexts[activeLayerId];
      if (!activeLayerContext) return;
      activeLayerContext.save();
      setDrawing(true);
      const adjustedPoint = getAdjustedPoint(point);
      tool.startStroke?.(adjustedPoint, activeLayerContext);
      onStartStroke?.(adjustedPoint);
    },
    [tool, layerContexts, activeLayerId, onStartStroke, getAdjustedPoint]
  );

  const continueStroke = useCallback(
    (newPoint: Point) => {
      const activeLayerContext = layerContexts[activeLayerId];
      if (!activeLayerContext) return;
      const adjustedPoint = getAdjustedPoint(newPoint);
      tool.continueStroke?.(adjustedPoint, activeLayerContext);
      onContinueStroke?.(adjustedPoint);
      composeLayers();
    },
    [
      tool,
      layerContexts,
      activeLayerId,
      onContinueStroke,
      composeLayers,
      getAdjustedPoint
    ]
  );

  const endStroke = useCallback(() => {
    const activeLayerContext = layerContexts[activeLayerId];
    if (!activeLayerContext) return;
    setDrawing(false);
    tool.endStroke?.(activeLayerContext);
    onEndStroke?.();
    activeLayerContext.restore();
    composeLayers();
    if (canvas && history) {
      history.pushState(canvas);
    }
    if (onContentChange) {
      const newContent = canvas?.toDataURL() || '';
      onContentChange(newContent);
      window.dispatchEvent(
        new CustomEvent('content-updated', {
          detail: { content: newContent }
        })
      );
    }
  }, [
    tool,
    layerContexts,
    activeLayerId,
    canvas,
    history,
    onEndStroke,
    onContentChange,
    composeLayers
  ]);

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
      const newContent = canvas?.toDataURL() || '';
      onContentChange(newContent);
      window.dispatchEvent(
        new CustomEvent('content-updated', { detail: { content: newContent } })
      );
    }
  }, [context, canvas, history, onContentChange]);

  const gotRef = useCallback(
    (canvasRef: HTMLCanvasElement) => {
      if (!canvasRef) {
        return;
      }
      const aspectRatio = width / height;
      const canvasSize = Math.min(width, height);
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
    [width, height, content, history]
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

  const resizeCanvas = useCallback(() => {
    if (!canvas || !context) return;

    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempContext?.drawImage(canvas, 0, 0);

    canvas.width = width;
    canvas.height = height;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(tempCanvas, 0, 0);

    Object.values(layerContexts).forEach((layerContext) => {
      const tempLayerCanvas = document.createElement('canvas');
      const tempLayerContext = tempLayerCanvas.getContext('2d');
      tempLayerCanvas.width = layerContext.canvas.width;
      tempLayerCanvas.height = layerContext.canvas.height;
      tempLayerContext?.drawImage(layerContext.canvas, 0, 0);

      layerContext.canvas.width = width;
      layerContext.canvas.height = height;
      layerContext.fillStyle = '#ffffff';
      layerContext.fillRect(0, 0, width, height);
      layerContext.drawImage(tempLayerCanvas, 0, 0);
    });

    composeLayers();
  }, [canvas, context, width, height, layerContexts, composeLayers]);

  useEffect(() => {
    resizeCanvas();
    if (onResize) {
      onResize();
    }
  }, [width, height, resizeCanvas, onResize]);

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
    if (onResize) {
      onResize();
    }
    if (canvas && context) {
      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      };
      image.src = content || '';
    }
  }, [width, height, onResize, canvas, context, content]);

  useEffect(() => {
    if (onContentChange) {
      onContentChange(canvas?.toDataURL() || '');
    }
  }, [canvas, onContentChange]);

  return (
    <canvas
      style={{
        cursor: tool?.cursor,
        touchAction: 'none',
        ...style
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
  );
});
