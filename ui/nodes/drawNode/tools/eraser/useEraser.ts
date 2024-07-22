import { useCallback } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/components/DrawNodeArtboard';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';

export interface UseEraserProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useEraser({
  strokeWidth = 25,
  opacity = 1,
  blendMode = 'destination-out'
}: UseEraserProps): ToolHandlers {
  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.globalCompositeOperation = blendMode;
      context.lineWidth = strokeWidth;
      context.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      context.lineJoin = context.lineCap = 'round';
      context.moveTo(point[0], point[1]);
      context.beginPath();
    },
    [strokeWidth, opacity, blendMode]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.lineTo(point[0], point[1]);
      context.stroke();
    },
    []
  );

  const cursor = circleCursor(strokeWidth);

  return { name: 'Eraser', startStroke, continueStroke, cursor };
}
