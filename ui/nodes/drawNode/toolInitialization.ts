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
  defaultColor: string;
}

export const useInitializeTools = (): Array<ToolConfig> => {
  const penTool = usePen({});
  const lineTool = useLine({});
  const rectangleTool = useRectangle({});
  const circleTool = useCircle({});
  const markerTool = useMarker({});
  const brushTool = useBrush({});
  const watercolorTool = useWatercolor({});
  const airbrushTool = useAirbrush({});
  const shadingBrushTool = useShadingBrush({});
  const eraserTool = useEraser({});

  return [
    {
      tool: penTool,
      icon: FaPen,
      defaultStrokeWidth: 2,
      defaultColor: '#635E87'
    },
    {
      tool: lineTool,
      icon: BsSlashLg,
      defaultStrokeWidth: 2,
      defaultColor: '#FF6347'
    },
    {
      tool: rectangleTool,
      icon: FaSquare,
      defaultStrokeWidth: 2,
      defaultColor: '#4682B4'
    },
    {
      tool: circleTool,
      icon: FaCircle,
      defaultStrokeWidth: 2,
      defaultColor: '#32CD32'
    },
    {
      tool: markerTool,
      icon: FaMarker,
      defaultStrokeWidth: 20,
      defaultColor: '#A78BFA'
    },
    {
      tool: brushTool,
      icon: FaPaintBrush,
      defaultStrokeWidth: 20,
      defaultColor: '#F472B6'
    },
    {
      tool: watercolorTool,
      icon: IoMdWater,
      defaultStrokeWidth: 20,
      defaultColor: '#8BD8BD'
    },
    {
      tool: airbrushTool,
      icon: FaSprayCan,
      defaultStrokeWidth: 20,
      defaultColor: '#F9D342'
    },
    {
      tool: shadingBrushTool,
      icon: FaPen,
      defaultStrokeWidth: 20,
      defaultColor: '#A1A1A1'
    },
    {
      tool: eraserTool,
      icon: FaEraser,
      defaultStrokeWidth: 40,
      defaultColor: '#FFFFFF'
    }
  ];
};
