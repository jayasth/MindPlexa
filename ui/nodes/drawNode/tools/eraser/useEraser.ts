import { useCallback } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';
import { circleCursor } from '../../utils/cursors';
import { ToolSetting } from '../../types';

export interface UseEraserProps {
  strokeWidth?: number;
  opacity?: number;
}

export function useEraser({
  strokeWidth = 40,
  opacity = 1
}: UseEraserProps = {}): ToolHandlers {
  const startStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      const { strokeWidth: settingsStrokeWidth, opacity: settingsOpacity } =
        settings;
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = '#FFFFFF'; // Use white color for erasing
      context.lineWidth = settingsStrokeWidth || strokeWidth;
      context.globalAlpha = settingsOpacity ?? opacity;
      context.lineJoin = context.lineCap = 'round';
      context.moveTo(point[0], point[1]);
      context.beginPath();
    },
    [strokeWidth, opacity]
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

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalCompositeOperation = 'source-over'; // Reset to default
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: 'Eraser', startStroke, continueStroke, endStroke, cursor };
}
