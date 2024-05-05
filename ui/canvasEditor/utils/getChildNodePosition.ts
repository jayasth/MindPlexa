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

  const parentNodeWidth = parentNode.width || 100;
  const parentNodeHeight = parentNode.height || 100;

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

  const childNodeWidth = nodeDimensions['selectionMenu'].width;
  const childNodeHeight = nodeDimensions['selectionMenu'].height;

  const childNodeX =
    flowPosition.x -
    parentNode.position.x +
    parentNodeWidth / 2 -
    childNodeWidth / 2;
  const childNodeY =
    flowPosition.y -
    parentNode.position.y +
    parentNodeHeight / 2 -
    childNodeHeight / 2;

  return { x: childNodeX, y: childNodeY };
};
