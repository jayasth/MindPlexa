import { Node, XYPosition } from 'reactflow';
import { nodeDimensions } from './nodeProperties';

export const getChildNodePosition = (
  event: React.MouseEvent<Element, MouseEvent>,
  parentNode: Node<any>
): XYPosition | null => {
  console.log('Event:', event);
  console.log('Parent Node:', parentNode);
  const canvasRect = event.currentTarget.getBoundingClientRect();
  console.log('Canvas Rect:', canvasRect);
  const canvasX = event.clientX - canvasRect.left;
  const canvasY = event.clientY - canvasRect.top;

  const parentNodeType = parentNode.type || 'note'; // Use 'note' as the default type if parentNode.type is undefined
  console.log('Parent Node Type:', parentNodeType);
  const parentNodeDimensions = nodeDimensions[parentNodeType] || {
    width: 100,
    height: 150
  }; // Use default dimensions if parentNodeType is not found in nodeDimensions
  console.log('Parent Node Dimensions:', parentNodeDimensions);
  const childNodeDimensions = nodeDimensions['selectionMenu'];
  console.log('Child Node Dimensions:', childNodeDimensions);

  const childX =
    canvasX - childNodeDimensions.width / 2 + parentNodeDimensions.width / 2;
  const childY =
    canvasY - childNodeDimensions.height / 2 + parentNodeDimensions.height / 2;

  const childPosition = { x: childX, y: childY };
  console.log('Child Position:', childPosition);

  return childPosition;
};
