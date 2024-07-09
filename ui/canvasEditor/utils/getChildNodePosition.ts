import { Node, XYPosition } from 'reactflow';
import { nodeDimensions } from './nodeProperties';

export const getChildNodePosition = (
  event: MouseEvent | TouchEvent,
  parentNode: Node,
  domNode: HTMLElement,
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition
): XYPosition => {
  if (!domNode || !parentNode || !parentNode.position) {
    throw new Error('getChildNodePosition: Missing required parameters');
  }

  const isTouchEvent = 'touches' in event;
  const clientX = isTouchEvent ? event.touches[0].clientX : event.clientX;
  const clientY = isTouchEvent ? event.touches[0].clientY : event.clientY;

  console.log('getChildNodePosition: Event coordinates:', { clientX, clientY });

  // Get the zoom level and pan offset from the domNode
  const reactFlowBounds = domNode.getBoundingClientRect();
  const zoomLevel = reactFlowBounds.width / domNode.offsetWidth;
  const panX = (reactFlowBounds.left - domNode.offsetLeft) / zoomLevel;
  const panY = (reactFlowBounds.top - domNode.offsetTop) / zoomLevel;

  // Adjust the mouse event coordinates based on the zoom level and pan offset
  const adjustedClientX = (clientX - reactFlowBounds.left) / zoomLevel + panX;
  const adjustedClientY = (clientY - reactFlowBounds.top) / zoomLevel + panY;

  console.log('getChildNodePosition: Adjusted coordinates:', {
    adjustedClientX,
    adjustedClientY
  });
  console.log(
    'getChildNodePosition: Parent node position:',
    parentNode.position
  );
  console.log('getChildNodePosition: DOM node bounds:', reactFlowBounds);

  const flowPosition = screenToFlowPosition({
    x: adjustedClientX,
    y: adjustedClientY
  });

  console.log('getChildNodePosition: Flow position:', flowPosition);

  const childNodeWidth = nodeDimensions['selectionMenu'].width;
  const childNodeHeight = nodeDimensions['selectionMenu'].height;

  console.log(
    'getChildNodePosition: Child node dimensions:',
    childNodeWidth,
    childNodeHeight
  );

  // Position the child node relative to the parent node position
  const childNodeX =
    parentNode.position.x +
    (flowPosition.x - parentNode.position.x) -
    childNodeWidth / 2;
  const childNodeY =
    parentNode.position.y +
    (flowPosition.y - parentNode.position.y) -
    childNodeHeight / 2;

  return { x: childNodeX, y: childNodeY };
};
