export type Point = [number, number];

export const getTouchPoint = (
  event: React.TouchEvent,
  offset: { top: number; left: number }
): Point => {
  if (!event.currentTarget) {
    return [0, 0];
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const touch = event.targetTouches[0];
  return [
    touch.clientX - rect.left - offset.left,
    touch.clientY - rect.top - offset.top
  ];
};

export function getMousePoint(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvas: HTMLCanvasElement,
  offset: { top: number; left: number }
): Point {
  const rect = canvas.getBoundingClientRect();
  return [
    event.clientX - rect.left - offset.left,
    event.clientY - rect.top - offset.top
  ];
}

const BUTTON = 0b01;
export const mouseButtonIsDown = (buttons: number): boolean =>
  (BUTTON & buttons) === BUTTON;
