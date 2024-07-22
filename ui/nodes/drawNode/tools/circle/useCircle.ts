import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';

export interface UseCircleProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useCircle({
  color,
  strokeWidth = 2,
  opacity = 1,
  blendMode = 'source-over'
}: UseCircleProps): ToolHandlers {
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

      context.strokeStyle = color || '#000000'; // Set default color if not provided
      context.lineWidth = strokeWidth;
      context.globalAlpha = opacity; // Set opacity
      context.globalCompositeOperation = blendMode; // Set blend mode
      startPoint.current = point;
      isDrawing.current = true;
    },
    [color, strokeWidth, opacity, blendMode]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!isDrawing.current || !startPoint.current || !tempCanvas.current)
        return;

      const radiusX = Math.abs(point[0] - startPoint.current[0]) / 2;
      const radiusY = Math.abs(point[1] - startPoint.current[1]) / 2;
      const centerX =
        startPoint.current[0] + (point[0] - startPoint.current[0]) / 2;
      const centerY =
        startPoint.current[1] + (point[1] - startPoint.current[1]) / 2;

      // Clear the main canvas and redraw the temporary canvas
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.drawImage(tempCanvas.current, 0, 0);

      context.beginPath();
      context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
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

  return { name: 'Circle', startStroke, continueStroke, endStroke, cursor };
}
