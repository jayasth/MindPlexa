import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';

export interface UseBrushProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useBrush({
  color = '#000000',
  strokeWidth = 5,
  opacity = 1,
  blendMode = 'source-over'
}: UseBrushProps): ToolHandlers {
  const lastPoints = useRef<Point[]>([]);
  const lastVelocity = useRef<number>(0);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.save();
      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
      context.globalAlpha = opacity;
      context.globalCompositeOperation = blendMode;
      context.lineJoin = context.lineCap = 'round';
      context.beginPath();
      context.moveTo(point[0], point[1]);
      lastPoints.current = [point];
    },
    [color, strokeWidth, opacity, blendMode]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      lastPoints.current.push(point);
      if (lastPoints.current.length > 3) {
        const xc = (lastPoints.current[2][0] + point[0]) / 2;
        const yc = (lastPoints.current[2][1] + point[1]) / 2;

        const dx = point[0] - lastPoints.current[0][0];
        const dy = point[1] - lastPoints.current[0][1];
        const velocity = Math.sqrt(dx * dx + dy * dy);

        const smoothingFactor = 0.2;
        const lineWidth =
          strokeWidth - (velocity - lastVelocity.current) * smoothingFactor;

        context.lineWidth = Math.max(0.5, Math.min(strokeWidth * 2, lineWidth));
        context.quadraticCurveTo(
          lastPoints.current[2][0],
          lastPoints.current[2][1],
          xc,
          yc
        );
        context.stroke();
        context.beginPath();
        context.moveTo(xc, yc);

        lastPoints.current.shift();
        lastVelocity.current = velocity;
      }
    },
    [strokeWidth]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.stroke();
    context.restore();
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: 'Brush', startStroke, continueStroke, endStroke, cursor };
}
