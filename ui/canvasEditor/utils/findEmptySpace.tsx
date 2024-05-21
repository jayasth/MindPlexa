import { Node, XYPosition } from 'reactflow';

export const findEmptySpace = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): XYPosition => {
  const padding = 50;
  let position = { x: padding, y: padding };

  while (
    nodes.some(
      (node) =>
        Math.abs(node.position.x - position.x) < padding &&
        Math.abs(node.position.y - position.y) < padding
    )
  ) {
    position.x += padding;
    if (position.x + padding > canvasSize.width) {
      position.x = padding;
      position.y += padding;
    }
  }

  return position;
};
