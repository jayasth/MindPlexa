import { Node, XYPosition } from 'reactflow';
import { nodeDimensions } from './nodeProperties';

export const getChildNodePosition = (
  event: MouseEvent | TouchEvent,
  parentNode: Node,
  domNode: HTMLElement,
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition
): XYPosition | null => {
  if (!domNode || !parentNode || !parentNode.position) {
    return null;
  }

  const isTouchEvent = 'touches' in event;
  const clientX = isTouchEvent ? event.touches[0].clientX : event.clientX;
  const clientY = isTouchEvent ? event.touches[0].clientY : event.clientY;

  // Get the zoom level from the domNode
  const zoomLevel = domNode.getBoundingClientRect().width / domNode.offsetWidth;

  // Adjust the mouse event coordinates based on the zoom level
  const adjustedClientX = clientX / zoomLevel;
  const adjustedClientY = clientY / zoomLevel;

  const flowPosition = screenToFlowPosition({
    x: adjustedClientX,
    y: adjustedClientY
  });

  console.log('Flow position:', flowPosition);

  const childNodeWidth = nodeDimensions['selectionMenu'].width;
  const childNodeHeight = nodeDimensions['selectionMenu'].height;

  console.log('Child node dimensions:', childNodeWidth, childNodeHeight);

  // Position the child node at the exact location where the mouse was released
  const childNodeX = flowPosition.x - childNodeWidth / 2;
  const childNodeY = flowPosition.y - childNodeHeight / 2;

  return { x: childNodeX, y: childNodeY };
};
