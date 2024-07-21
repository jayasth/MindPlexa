import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';

export interface UseCircleProps {
  color?: string;
  strokeWidth?: number;
}

export function useCircle({
  color = '#000000',
  strokeWidth = 2
}: UseCircleProps): ToolHandlers {
  const startPoint = useRef<Point | null>(null);
  const isDrawing = useRef(false);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
      context.beginPath();
      startPoint.current = point;
      isDrawing.current = true;
    },
    [color, strokeWidth]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!isDrawing.current || !startPoint.current) return;

      const radiusX = Math.abs(point[0] - startPoint.current[0]) / 2;
      const radiusY = Math.abs(point[1] - startPoint.current[1]) / 2;
      const centerX =
        startPoint.current[0] + (point[0] - startPoint.current[0]) / 2;
      const centerY =
        startPoint.current[1] + (point[1] - startPoint.current[1]) / 2;

      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.beginPath();
      context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      context.stroke();
    },
    []
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    isDrawing.current = false;
    startPoint.current = null;
  }, []);

  const cursor = 'crosshair';

  return { name: 'Circle', startStroke, continueStroke, endStroke, cursor };
}
