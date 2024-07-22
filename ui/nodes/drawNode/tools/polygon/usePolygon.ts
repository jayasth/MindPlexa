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
  const tempCanvas = useRef<HTMLCanvasElement | null>(null);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!tempCanvas.current) {
        tempCanvas.current = document.createElement('canvas');
        tempCanvas.current.width = context.canvas.width;
        tempCanvas.current.height = context.canvas.height;
      }
      const tempCtx = tempCanvas.current.getContext('2d');
      if (tempCtx) {
        tempCtx.strokeStyle = color;
        tempCtx.lineWidth = strokeWidth;
        tempCtx.lineJoin = 'round';
        tempCtx.lineCap = 'round';
        tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
      }
      points.current = [point];
      isDrawing.current = true;
    },
    [color, strokeWidth]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!isDrawing.current || !tempCanvas.current) return;

      const tempCtx = tempCanvas.current.getContext('2d');
      if (!tempCtx) return;

      // Clear the temporary canvas and redraw the existing points
      tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
      tempCtx.beginPath();
      tempCtx.moveTo(points.current[0][0], points.current[0][1]);

      // Draw straight lines to each point using lineTo
      for (let i = 1; i < points.current.length; i++) {
        tempCtx.lineTo(points.current[i][0], points.current[i][1]);
      }

      // Draw the line to the current point using lineTo
      tempCtx.lineTo(point[0], point[1]);
      tempCtx.stroke();

      // Clear the main canvas and redraw the temporary canvas
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.drawImage(tempCanvas.current, 0, 0);

      points.current.push(point);
    },
    []
  );

  const endStroke = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (points.current.length > 2) {
        context.strokeStyle = color;
        context.lineWidth = strokeWidth;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(points.current[0][0], points.current[0][1]);
        for (let i = 1; i < points.current.length; i++) {
          context.lineTo(points.current[i][0], points.current[i][1]);
        }
        context.closePath();
        context.stroke();
      }
      isDrawing.current = false;
      points.current = [];
      if (tempCanvas.current) {
        const tempCtx = tempCanvas.current.getContext('2d');
        if (tempCtx) {
          tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
        }
      }
    },
    [color, strokeWidth]
  );

  const cursor = 'crosshair';

  return { name: 'Polygon', startStroke, continueStroke, endStroke, cursor };
}
