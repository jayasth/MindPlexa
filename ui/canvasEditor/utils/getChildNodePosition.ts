import { Node, XYPosition } from 'reactflow';

export const getChildNodePosition = (
  event: MouseEvent | TouchEvent,
  parentNode: Node,
  domNode: HTMLElement,
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition
): XYPosition | null => {
  if (!domNode || !parentNode || !parentNode.position) {
    return null;
  }

  const parentNodeWidth = parentNode.width || 100;
  const parentNodeHeight = parentNode.height || 100;

  const isTouchEvent = 'touches' in event;
  const clientX = isTouchEvent ? event.touches[0].clientX : event.clientX;
  const clientY = isTouchEvent ? event.touches[0].clientY : event.clientY;

  const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });

  const childNodeX =
    flowPosition.x - parentNode.position.x - parentNodeWidth / 2;
  const childNodeY =
    flowPosition.y - parentNode.position.y - parentNodeHeight / 2;

  return { x: childNodeX, y: childNodeY };
};
