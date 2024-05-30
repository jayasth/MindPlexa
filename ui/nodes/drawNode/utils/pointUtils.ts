export type Point = [number, number];

export const getTouchPoint = (event: React.TouchEvent): Point => {
  if (!event.currentTarget) {
    return [0, 0];
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const touch = event.targetTouches[0];
  return [touch.clientX - rect.left, touch.clientY - rect.top];
};

export function getMousePoint(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}

const BUTTON = 0b01;
export const mouseButtonIsDown = (buttons: number): boolean =>
  (BUTTON & buttons) === BUTTON;
