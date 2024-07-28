import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';
import { ToolSetting } from '../../types';

export interface UseMarkerProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useMarker({
  color = '#000000',
  strokeWidth = 20,
  opacity = 1,
  blendMode = 'source-over'
}: UseMarkerProps = {}): ToolHandlers {
  const lastPoint = useRef<Point>();

  const startStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      const {
        color: settingsColor,
        strokeWidth: settingsStrokeWidth,
        opacity: settingsOpacity,
        blendMode: settingsBlendMode
      } = settings;
      context.lineWidth = settingsStrokeWidth || strokeWidth;
      context.lineJoin = context.lineCap = 'round';
      lastPoint.current = point;
      context.strokeStyle = settingsColor || color;
      context.globalAlpha = settingsOpacity ?? opacity;
      context.globalCompositeOperation = (settingsBlendMode ||
        blendMode) as GlobalCompositeOperation;
    },
    [color, strokeWidth, opacity, blendMode]
  );

  const continueStroke = useCallback(
    (
      newPoint: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      if (!lastPoint.current) {
        lastPoint.current = newPoint;
        return;
      }
      if (
        lastPoint.current[0] === newPoint[0] &&
        lastPoint.current[1] === newPoint[1]
      ) {
        return;
      }
      const { strokeWidth: settingsStrokeWidth, opacity: settingsOpacity } =
        settings;
      const currentStrokeWidth = settingsStrokeWidth || strokeWidth;
      const currentOpacity = settingsOpacity ?? opacity;

      context.beginPath();

      for (let i = 0; i < currentStrokeWidth; i += 2) {
        const offset = Math.round(currentStrokeWidth / 2 - i);
        context.globalAlpha =
          (1 / currentStrokeWidth) * (currentStrokeWidth - i) * currentOpacity;
        context.moveTo(
          lastPoint.current[0] - offset,
          lastPoint.current[1] - offset
        );
        context.lineTo(newPoint[0] - offset, newPoint[1] - offset);
        context.stroke();
      }
      context.globalAlpha = currentOpacity;
      context.beginPath();

      lastPoint.current = newPoint;
    },
    [strokeWidth, opacity]
  );

  const endStroke = useCallback(() => {
    lastPoint.current = undefined;
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: 'Marker', startStroke, continueStroke, endStroke, cursor };
}
