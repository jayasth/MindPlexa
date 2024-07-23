import {
  usePen,
  useLine,
  useRectangle,
  useCircle,
  useMarker,
  useBrush,
  useWatercolor,
  useAirbrush,
  useShadingBrush,
  useEraser,
  ToolHandlers
} from '@/ui/nodes/drawNode/DrawNodeTools';
import {
  FaPen,
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan,
  FaSquare,
  FaCircle
} from 'react-icons/fa';
import { IoMdWater } from 'react-icons/io';
import { BsSlashLg } from 'react-icons/bs';
import type { IconType } from 'react-icons/lib';

interface ToolConfig {
  tool: ToolHandlers;
  icon: IconType;
  defaultStrokeWidth: number;
}

export const initializeTools = (
  color: string,
  strokeWidth: number
): Array<ToolConfig> => {
  const pen = usePen({ color, strokeWidth });
  const line = useLine({ color, strokeWidth });
  const rectangle = useRectangle({ color, strokeWidth });
  const circle = useCircle({ color, strokeWidth });
  const marker = useMarker({ color, strokeWidth });
  const brush = useBrush({ color, strokeWidth });
  const watercolor = useWatercolor({ color, strokeWidth });
  const airbrush = useAirbrush({ color, strokeWidth });
  const shading = useShadingBrush({
    color,
    spreadFactor: (1 / 45) * strokeWidth,
    distanceThreshold: 100
  });
  const eraser = useEraser({ strokeWidth });

  return [
    { tool: pen, icon: FaPen, defaultStrokeWidth: 5 },
    { tool: line, icon: BsSlashLg, defaultStrokeWidth: 2 },
    { tool: rectangle, icon: FaSquare, defaultStrokeWidth: 2 },
    { tool: circle, icon: FaCircle, defaultStrokeWidth: 2 },
    { tool: marker, icon: FaMarker, defaultStrokeWidth: 20 },
    { tool: brush, icon: FaPaintBrush, defaultStrokeWidth: 20 },
    { tool: watercolor, icon: IoMdWater, defaultStrokeWidth: 20 },
    { tool: airbrush, icon: FaSprayCan, defaultStrokeWidth: 20 },
    { tool: shading, icon: FaPen, defaultStrokeWidth: 20 },
    { tool: eraser, icon: FaEraser, defaultStrokeWidth: 40 }
  ];
};
