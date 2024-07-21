import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';

export interface UsePolygonProps {
  color?: string;
  strokeWidth?: number;
}

export function usePolygon({
  color = '#000000',
  strokeWidth = 2
}: UsePolygonProps): ToolHandlers {
  const points = useRef<Point[]>([]);
  const isDrawing = useRef(false);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
      context.beginPath();
      points.current = [point];
      isDrawing.current = true;
    },
    [color, strokeWidth]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!isDrawing.current) return;

      points.current.push(point);

      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.beginPath();
      context.moveTo(points.current[0][0], points.current[0][1]);

      for (let i = 1; i < points.current.length; i++) {
        context.lineTo(points.current[i][0], points.current[i][1]);
      }

      context.stroke();
    },
    []
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    if (points.current.length > 2) {
      context.closePath();
      context.stroke();
    }
    isDrawing.current = false;
    points.current = [];
  }, []);

  const cursor = 'crosshair';

  return { name: 'Polygon', startStroke, continueStroke, endStroke, cursor };
}
