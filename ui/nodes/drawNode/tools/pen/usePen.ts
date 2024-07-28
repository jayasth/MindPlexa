import { useCallback, useRef } from 'react';
import { ToolHandlers } from '@/ui/nodes/drawNode/DrawNodeTools';
import { Point } from '../../utils/pointUtils';
import { ToolSetting } from '../../types';

export interface UsePenProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export function usePen({
  color = '#000000',
  strokeWidth = 2,
  opacity = 1,
  blendMode = 'source-over'
}: UsePenProps = {}): ToolHandlers {
  const points = useRef<Point[]>([]);
  const isDrawing = useRef(false);
  const tempCanvas = useRef<HTMLCanvasElement | null>(null);

  const startStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      if (!tempCanvas.current) {
        tempCanvas.current = document.createElement('canvas');
        tempCanvas.current.width = context.canvas.width;
        tempCanvas.current.height = context.canvas.height;
      }
      const tempCtx = tempCanvas.current.getContext('2d');
      if (tempCtx) {
        tempCtx.strokeStyle = settings.color || color;
        tempCtx.lineWidth = settings.strokeWidth || strokeWidth;
        tempCtx.globalAlpha = settings.opacity ?? opacity;
        tempCtx.globalCompositeOperation = (settings.blendMode ||
          blendMode) as GlobalCompositeOperation;
        tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
      }
      points.current = [point];
      isDrawing.current = true;
    },
    [color, strokeWidth, opacity, blendMode]
  );

  const continueStroke = useCallback(
    (
      point: Point,
      context: CanvasRenderingContext2D,
      settings: ToolSetting
    ) => {
      if (!isDrawing.current || !tempCanvas.current) return;

      points.current.push(point);
      const tempCtx = tempCanvas.current.getContext('2d');
      if (!tempCtx) return;

      tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
      tempCtx.beginPath();
      tempCtx.moveTo(points.current[0][0], points.current[0][1]);

      for (let i = 1; i < points.current.length - 2; i++) {
        const xc = (points.current[i][0] + points.current[i + 1][0]) / 2;
        const yc = (points.current[i][1] + points.current[i + 1][1]) / 2;
        tempCtx.quadraticCurveTo(
          points.current[i][0],
          points.current[i][1],
          xc,
          yc
        );
      }

      if (points.current.length > 2) {
        tempCtx.quadraticCurveTo(
          points.current[points.current.length - 2][0],
          points.current[points.current.length - 2][1],
          points.current[points.current.length - 1][0],
          points.current[points.current.length - 1][1]
        );
      }

      tempCtx.stroke();

      // Draw the preview on the main canvas without clearing it
      context.drawImage(tempCanvas.current, 0, 0);
    },
    []
  );

  const endStroke = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (points.current.length > 1) {
        context.save();
        context.strokeStyle = color;
        context.lineWidth = strokeWidth;
        context.globalAlpha = opacity;
        context.globalCompositeOperation = blendMode;
        context.beginPath();
        context.moveTo(points.current[0][0], points.current[0][1]);

        for (let i = 1; i < points.current.length - 2; i++) {
          const xc = (points.current[i][0] + points.current[i + 1][0]) / 2;
          const yc = (points.current[i][1] + points.current[i + 1][1]) / 2;
          context.quadraticCurveTo(
            points.current[i][0],
            points.current[i][1],
            xc,
            yc
          );
        }

        if (points.current.length > 2) {
          context.quadraticCurveTo(
            points.current[points.current.length - 2][0],
            points.current[points.current.length - 2][1],
            points.current[points.current.length - 1][0],
            points.current[points.current.length - 1][1]
          );
        }

        context.stroke();
        context.restore();
      }
      isDrawing.current = false;
      points.current = [];
      if (tempCanvas.current) {
        const tempCtx = tempCanvas.current.getContext('2d');
        if (tempCtx) {
          tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
        }
      }
    },
    [color, strokeWidth, opacity, blendMode]
  );

  const cursor = 'crosshair';

  return { name: 'Pen', startStroke, continueStroke, endStroke, cursor };
}
