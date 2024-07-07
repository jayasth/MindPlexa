import { Node, XYPosition } from 'reactflow';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

export const findOptimalPosition = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): XYPosition => {
  const padding = 100;

  if (nodes.length === 0) {
    return {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2
    };
  }

  // Sort nodes by z-index in descending order
  const sortedNodes = [...nodes].sort(
    (a, b) => (b.data?.zIndex || 0) - (a.data?.zIndex || 0)
  );

  // Try to find a position near the highest z-index node
  const highestNode = sortedNodes[0];
  let position = {
    x: highestNode.position.x + padding,
    y: highestNode.position.y + padding
  };

  let attempts = 0;
  const maxAttempts = 100;

  const getNodeSize = (node: Node) => {
    const dimensions = nodeDimensions[node.type as keyof typeof nodeDimensions];
    if ('width' in dimensions && 'height' in dimensions) {
      return { width: dimensions.width, height: dimensions.height };
    } else if ('viewWidth' in dimensions && 'viewHeight' in dimensions) {
      return { width: dimensions.viewWidth, height: dimensions.viewHeight };
    } else {
      return { width: 150, height: 60 }; // Default size
    }
  };

  while (
    sortedNodes.some((node) => {
      const nodeSize = getNodeSize(node);
      return (
        Math.abs(node.position.x - position.x) < nodeSize.width + padding &&
        Math.abs(node.position.y - position.y) < nodeSize.height + padding
      );
    }) &&
    attempts < maxAttempts
  ) {
    const randomDirectionX = Math.random() < 0.5 ? -1 : 1;
    const randomDirectionY = Math.random() < 0.5 ? -1 : 1;
    const randomOffsetX =
      Math.floor(Math.random() * padding) * randomDirectionX;
    const randomOffsetY =
      Math.floor(Math.random() * padding) * randomDirectionY;
    position.x += randomOffsetX;
    position.y += randomOffsetY;

    if (
      position.x < padding ||
      position.x + getNodeSize(highestNode).width > canvasSize.width
    ) {
      position.x = highestNode.position.x + padding * randomDirectionX;
    }
    if (
      position.y < padding ||
      position.y + getNodeSize(highestNode).height > canvasSize.height
    ) {
      position.y = highestNode.position.y + padding * randomDirectionY;
    }
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.error(
      'Failed to find optimal position: Canvas might be full or too crowded.'
    );
    return { x: canvasSize.width / 2, y: canvasSize.height / 2 };
  }

  return position;
};
