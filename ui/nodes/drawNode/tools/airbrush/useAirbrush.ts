import { useCallback, useRef } from 'react';
import tinycolor from 'tinycolor2';
import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';
import { ToolSetting } from '../../types';

export interface UseAirbrushProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useAirbrush({
  color = '#000000',
  strokeWidth = 25,
  opacity = 1,
  blendMode = 'darken'
}: UseAirbrushProps = {}): ToolHandlers {
  const isDrawing = useRef(false);

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
      context.globalCompositeOperation = (settingsBlendMode ||
        blendMode) as GlobalCompositeOperation;
      context.lineWidth = settingsStrokeWidth || strokeWidth;
      context.lineJoin = context.lineCap = 'round';
      context.strokeStyle = settingsColor || color;
      context.shadowBlur = (settingsStrokeWidth || strokeWidth) * 0.5;
      context.shadowColor = tinycolor(settingsColor || color)
        .setAlpha((settingsOpacity ?? opacity) * 0.5)
        .toPercentageRgbString();
      context.moveTo(point[0], point[1]);
      context.beginPath();
      isDrawing.current = true;
    },
    [color, strokeWidth, opacity, blendMode]
  );

  const endStroke = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const continueStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      if (!isDrawing.current) return;
      context.lineTo(point[0], point[1]);
      context.stroke();
    },
    []
  );

  const cursor = circleCursor(strokeWidth);

  return { name: 'Airbrush', startStroke, continueStroke, endStroke, cursor };
}
