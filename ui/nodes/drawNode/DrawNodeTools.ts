import { Point } from './utils/pointUtils';
import { ToolSetting } from './types';

// Export tools
export { useBrush } from './tools/brush/useBrush';
export { useMarker } from './tools/marker/useMarker';
export { useAirbrush } from './tools/airbrush/useAirbrush';
export { useShadingBrush } from './tools/shading/useShadingBrush';
export { useWatercolor } from './tools/watercolor/useWatercolor';
export { useEraser } from './tools/eraser/useEraser';
export { useCircle } from './tools/circle/useCircle';
export { useLine } from './tools/line/useLine';
export { useRectangle } from './tools/rectangle/useRectangle';
export { usePen } from './tools/pen/usePen';

// Export components
export type { ArtboardRef } from './components/DrawNodeArtboard';

// Export interfaces
export interface ToolHandlers {
  name: string;
  startStroke?: (
    point: Point,
    context: CanvasRenderingContext2D,
    settings: ToolSetting
  ) => void;
  continueStroke?: (
    point: Point,
    context: CanvasRenderingContext2D,
    settings: ToolSetting
  ) => void;
  endStroke?: (context: CanvasRenderingContext2D) => void;
  cursor?: string | ((strokeWidth: number) => string);
}

// Export utilities
export {
  getMousePoint,
  getTouchPoint,
  mouseButtonIsDown
} from './utils/pointUtils';
export type { Point } from './utils/pointUtils';
export { circleCursor } from './utils/cursors';

// Export history
export { useHistory } from './drawNodeHistory';
export type { History, HistoryHook } from './drawNodeHistory';
