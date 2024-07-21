import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';

export interface UseLineProps {
  color?: string;
  strokeWidth?: number;
}

export function useLine({
  color = '#000000',
  strokeWidth = 2
}: UseLineProps): ToolHandlers {
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

      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.beginPath();
      context.moveTo(startPoint.current[0], startPoint.current[1]);
      context.lineTo(point[0], point[1]);
      context.stroke();
    },
    []
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    isDrawing.current = false;
    startPoint.current = null;
  }, []);

  const cursor = 'crosshair';

  return { name: 'Line', startStroke, continueStroke, endStroke, cursor };
}
