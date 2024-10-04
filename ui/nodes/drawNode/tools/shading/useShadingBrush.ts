import { useCallback, useRef } from 'react';
import tinycolor from 'tinycolor2';

import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';

export interface UseShadingProps {
  color?: string;
  neighbourColor?: string;
  neighbourStrokeWidth?: number;
  distanceThreshold?: number;
  spreadFactor?: number;
  opacity?: number;
}

export function useShadingBrush({
  color,
  neighbourColor,
  distanceThreshold = 40,
  neighbourStrokeWidth,
  spreadFactor = 0.9,
  opacity = 1
}: UseShadingProps = {}): ToolHandlers {
  const points = useRef<Array<Point>>([]);
  const threshold = distanceThreshold * distanceThreshold;

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.lineWidth = 1;
      context.lineJoin = context.lineCap = 'round';
      context.globalAlpha = opacity;
      points.current = [point];
    },
    [opacity]
  );

  const continueStroke = useCallback(
    (newPoint: Point, context: CanvasRenderingContext2D) => {
      context.strokeStyle = color || context.strokeStyle;
      context.lineWidth = neighbourStrokeWidth || 1;

      points.current.push(newPoint);
      context.beginPath();
      const [prevX, prevY] = points.current[points.current.length - 2];
      context.moveTo(prevX, prevY);
      context.lineTo(...newPoint);
      context.stroke();
      context.lineWidth = neighbourStrokeWidth || context.lineWidth;

      for (const point of points.current) {
        const dx = point[0] - newPoint[0];
        const dy = point[1] - newPoint[1];
        const distance = dx * dx + dy * dy;

        if (distance < threshold && Math.random() > distance / threshold) {
          context.beginPath();
          context.strokeStyle =
            neighbourColor ||
            tinycolor(color || context.strokeStyle)
              .setAlpha(0.2)
              .toPercentageRgbString();
          context.moveTo(
            newPoint[0] + dx * spreadFactor,
            newPoint[1] + dy * spreadFactor
          );
          context.lineTo(
            point[0] - dx * spreadFactor,
            point[1] - dy * spreadFactor
          );
          context.stroke();
        }
      }
    },
    [color, neighbourStrokeWidth, spreadFactor, threshold, neighbourColor]
  );

  const endStroke = useCallback(() => {}, []);

  const cursor = 'crosshair';

  return { name: 'Shading', startStroke, continueStroke, endStroke, cursor };
}
