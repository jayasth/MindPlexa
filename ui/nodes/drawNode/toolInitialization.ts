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

export const initializeTools = (): Array<ToolConfig> => {
  return [
    {
      tool: usePen({}),
      icon: FaPen,
      defaultStrokeWidth: 2,
      defaultColor: '#575757'
    },
    {
      tool: useLine({}),
      icon: BsSlashLg,
      defaultStrokeWidth: 2,
      defaultColor: '#636363'
    },
    {
      tool: useRectangle({}),
      icon: FaSquare,
      defaultStrokeWidth: 2,
      defaultColor: '#989FF0'
    },
    {
      tool: useCircle({}),
      icon: FaCircle,
      defaultStrokeWidth: 2,
      defaultColor: '#60A5FA'
    },
    {
      tool: useMarker({}),
      icon: FaMarker,
      defaultStrokeWidth: 20,
      defaultColor: '#A78BFA'
    },
    {
      tool: useBrush({}),
      icon: FaPaintBrush,
      defaultStrokeWidth: 20,
      defaultColor: '#F472B6'
    },
    {
      tool: useWatercolor({}),
      icon: IoMdWater,
      defaultStrokeWidth: 20,
      defaultColor: '#8BD8BD'
    },
    {
      tool: useAirbrush({}),
      icon: FaSprayCan,
      defaultStrokeWidth: 20,
      defaultColor: '#F9D342'
    },
    {
      tool: useShadingBrush({}),
      icon: FaPen,
      defaultStrokeWidth: 20,
      defaultColor: '#A1A1A1'
    },
    {
      tool: useEraser({}),
      icon: FaEraser,
      defaultStrokeWidth: 40,
      defaultColor: '#FFFFFF'
    }
  ];
};
