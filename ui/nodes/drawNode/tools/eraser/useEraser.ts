import { useCallback } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';
import { ToolSetting } from '../../types';

export interface UseEraserProps {
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function useEraser({
  strokeWidth = 40,
  opacity = 1,
  blendMode = 'destination-out'
}: UseEraserProps = {}): ToolHandlers {
  const startStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      const {
        strokeWidth: settingsStrokeWidth,
        opacity: settingsOpacity,
        blendMode: settingsBlendMode
      } = settings;
      context.globalCompositeOperation = (settingsBlendMode ||
        blendMode) as GlobalCompositeOperation;
      context.lineWidth = settingsStrokeWidth || strokeWidth;
      context.globalAlpha = settingsOpacity ?? opacity;
      context.lineJoin = context.lineCap = 'round';
      context.moveTo(point[0], point[1]);
      context.beginPath();
    },
    [strokeWidth, opacity, blendMode]
  );

  const continueStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      context.lineTo(point[0], point[1]);
      context.stroke();
    },
    []
  );

  const endStroke = useCallback(() => {
    // Add any necessary cleanup logic here
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: 'Eraser', startStroke, continueStroke, endStroke, cursor };
}
