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
export { usePolygon } from './tools/polygon/usePolygon';
export * from './tools/brush/brushHelpers';
export * from './tools/watercolor/watercolor';

// Export components
export { Artboard } from './components/DrawNodeArtboard';
export type { ArtboardRef, ToolHandlers } from './components/DrawNodeArtboard';

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
