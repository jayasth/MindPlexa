import { Node, XYPosition } from 'reactflow';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

export const findOptimalPosition = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): XYPosition => {
  const padding = 100;
  let initialPosition = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2
  };
  let lastNodePosition =
    nodes.length > 0 ? nodes[nodes.length - 1].position : initialPosition;

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

  let attempts = 0;
  const maxAttempts = 100;
  let position = { ...lastNodePosition };

  while (
    nodes.some((node) => {
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
      position.x + getNodeSize(nodes[nodes.length - 1]).width > canvasSize.width
    ) {
      position.x = lastNodePosition.x + padding * randomDirectionX;
    }
    if (
      position.y < padding ||
      position.y + getNodeSize(nodes[nodes.length - 1]).height >
        canvasSize.height
    ) {
      position.y = lastNodePosition.y + padding * randomDirectionY;
    }
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.error(
      'Failed to find optimal position: Canvas might be full or too crowded.'
    );
    return { x: -1, y: -1 };
  }

  return position;
};
