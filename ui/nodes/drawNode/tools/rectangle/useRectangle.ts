import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';

export interface UseRectangleProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useRectangle({
  color = '#000000',
  strokeWidth = 2,
  opacity = 1,
  blendMode = 'source-over'
}: UseRectangleProps): ToolHandlers {
  const startPoint = useRef<Point | null>(null);
  const isDrawing = useRef(false);
  const tempCanvas = useRef<HTMLCanvasElement | null>(null);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      // Create a temporary canvas
      tempCanvas.current = document.createElement('canvas');
      tempCanvas.current.width = context.canvas.width;
      tempCanvas.current.height = context.canvas.height;
      const tempCtx = tempCanvas.current.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(context.canvas, 0, 0);
      }

      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
      context.globalAlpha = opacity;
      context.globalCompositeOperation = blendMode;
      startPoint.current = point;
      isDrawing.current = true;
    },
    [color, strokeWidth, opacity, blendMode]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!isDrawing.current || !startPoint.current || !tempCanvas.current)
        return;

      const width = point[0] - startPoint.current[0];
      const height = point[1] - startPoint.current[1];

      // Clear the main canvas and redraw the temporary canvas
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.drawImage(tempCanvas.current, 0, 0);

      // Draw the new rectangle
      context.beginPath();
      context.rect(startPoint.current[0], startPoint.current[1], width, height);
      context.stroke();
    },
    []
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    isDrawing.current = false;
    startPoint.current = null;
    tempCanvas.current = null;
  }, []);

  const cursor = 'crosshair';

  return { name: 'Rectangle', startStroke, continueStroke, endStroke, cursor };
}
