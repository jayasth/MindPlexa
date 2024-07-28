import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';
import { splodgeTrail } from './watercolor';

export interface UseWatercolorProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useWatercolor({
  color = '#000000',
  strokeWidth = 25,
  opacity = 1,
  blendMode = 'source-over'
}: UseWatercolorProps): ToolHandlers {
  const points = useRef<Array<Point>>([]);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.fillStyle = color;
      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
      context.shadowColor = color;
      context.globalAlpha = opacity;
      points.current = [point];
      splodgeTrail(points.current, strokeWidth * 1.1, 1, context);
    },
    [color, strokeWidth, opacity]
  );

  const endStroke = useCallback(() => {
    points.current = [];
  }, []);

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      points.current.push(point);
      context.globalCompositeOperation = blendMode;
      splodgeTrail(points.current, strokeWidth, 5, context);
    },
    [strokeWidth, blendMode]
  );

  const cursor = circleCursor(strokeWidth);

  return { name: 'Watercolor', startStroke, continueStroke, endStroke, cursor };
}
