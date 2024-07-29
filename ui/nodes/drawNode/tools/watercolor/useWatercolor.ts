import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';
import { splodgeTrail } from './watercolor';
import { ToolSetting } from '../../types';

export interface UseWatercolorProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}

export function useWatercolor({
  color = '#000000',
  strokeWidth = 25,
  opacity = 1
}: UseWatercolorProps = {}): ToolHandlers {
  const points = useRef<Array<Point>>([]);

  const startStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      const {
        color: settingsColor,
        strokeWidth: settingsStrokeWidth,
        opacity: settingsOpacity
      } = settings;
      context.fillStyle = settingsColor || color;
      context.strokeStyle = settingsColor || color;
      context.lineWidth = settingsStrokeWidth || strokeWidth;
      context.shadowColor = settingsColor || color;
      context.globalAlpha = settingsOpacity ?? opacity;
      points.current = [point];
      splodgeTrail(
        points.current,
        ((settingsStrokeWidth || strokeWidth) ?? 1) * 1.1,
        1,
        context
      );
    },
    [color, strokeWidth, opacity]
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
      const { strokeWidth: settingsStrokeWidth } = settings;
      points.current.push(point);
      splodgeTrail(
        points.current,
        settingsStrokeWidth || strokeWidth,
        5,
        context
      );
    },
    [strokeWidth]
  );

  const cursor = circleCursor(strokeWidth);

  return { name: 'Watercolor', startStroke, continueStroke, endStroke, cursor };
}
