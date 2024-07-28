import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';
import { splodgeTrail } from './watercolor';
import { ToolSetting } from '../../types';

export function useWatercolor(): ToolHandlers {
  const points = useRef<Array<Point>>([]);

  const startStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      const { color, strokeWidth, opacity, blendMode } = settings;
      context.fillStyle = color;
      context.strokeStyle = color;
      context.lineWidth = strokeWidth;
      context.shadowColor = color;
      context.globalAlpha = opacity ?? 1;
      context.globalCompositeOperation = blendMode as GlobalCompositeOperation;
      points.current = [point];
      splodgeTrail(points.current, (strokeWidth ?? 1) * 1.1, 1, context);
    },
    []
  );

  const endStroke = useCallback(() => {
    points.current = [];
  }, []);

  const continueStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      const { strokeWidth, blendMode } = settings;
      points.current.push(point);
      context.globalCompositeOperation = blendMode as GlobalCompositeOperation;
      splodgeTrail(points.current, strokeWidth, 5, context);
    },
    []
  );

  const cursor = circleCursor(25); // Default stroke width

  return { name: 'Watercolor', startStroke, continueStroke, endStroke, cursor };
}
