import { Node, Edge } from 'reactflow';

export const optimizeAINodePositions = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType:
    | 'hierarchical'
    | 'circular'
    | 'forceDirected'
    | 'spiral' = 'hierarchical'
): Node[] => {
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  // Create a map of nodes for quick access
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // Create a map of child nodes for each parent
  const childrenMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  });

  // Find the root node (node with no incoming edges)
  const rootNodeId = nodes.find(
    (node) => !edges.some((edge) => edge.target === node.id)
  )?.id;

  if (!rootNodeId) return nodes;

  const hierarchicalLayout = () => {
    const positionNode = (
      nodeId: string,
      x: number,
      y: number,
      level: number,
      index: number,
      siblings: number
    ) => {
      const node = nodeMap.get(nodeId)!;
      const levelWidth = Math.min(canvasSize.width * 0.8, siblings * 200);
      const xOffset = (index - (siblings - 1) / 2) * (levelWidth / siblings);
      node.position = { x: x + xOffset, y };

      const children = childrenMap.get(nodeId) || [];
      children.forEach((childId, childIndex) => {
        positionNode(
          childId,
          x + xOffset,
          y + 150,
          level + 1,
          childIndex,
          children.length
        );
      });
    };

    positionNode(rootNodeId, centerX, 50, 0, 0, 1);
  };

  const circularLayout = () => {
    const positionNode = (
      nodeId: string,
      angle: number,
      radius: number,
      level: number
    ) => {
      const node = nodeMap.get(nodeId)!;
      node.position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };

      const children = childrenMap.get(nodeId) || [];
      const angleStep = (2 * Math.PI) / children.length;
      children.forEach((childId, index) => {
        positionNode(
          childId,
          angle + index * angleStep,
          radius + 150,
          level + 1
        );
      });
    };

    positionNode(rootNodeId, 0, 0, 0);
  };

  const forceDirectedLayout = () => {
    const repulsionForce = 1000;
    const attractionForce = 0.1;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      nodes.forEach((node) => {
        node.position = node.position || {
          x: Math.random() * canvasSize.width,
          y: Math.random() * canvasSize.height
        };
      });

      nodes.forEach((nodeA) => {
        nodes.forEach((nodeB) => {
          if (nodeA.id !== nodeB.id) {
            const dx = nodeA.position.x - nodeB.position.x;
            const dy = nodeA.position.y - nodeB.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsionForce / (distance * distance);

            nodeA.position.x += (dx / distance) * force;
            nodeA.position.y += (dy / distance) * force;
            nodeB.position.x -= (dx / distance) * force;
            nodeB.position.y -= (dy / distance) * force;
          }
        });
      });

      edges.forEach((edge) => {
        const sourceNode = nodeMap.get(edge.source)!;
        const targetNode = nodeMap.get(edge.target)!;
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = attractionForce * (distance - 200);

        sourceNode.position.x += (dx / distance) * force;
        sourceNode.position.y += (dy / distance) * force;
        targetNode.position.x -= (dx / distance) * force;
        targetNode.position.y -= (dy / distance) * force;
      });
    }

    // Center the layout
    const avgX =
      nodes.reduce((sum, node) => sum + node.position.x, 0) / nodes.length;
    const avgY =
      nodes.reduce((sum, node) => sum + node.position.y, 0) / nodes.length;
    nodes.forEach((node) => {
      node.position.x += centerX - avgX;
      node.position.y += centerY - avgY;
    });
  };

  const spiralLayout = () => {
    const positionNode = (nodeId: string, index: number) => {
      const node = nodeMap.get(nodeId)!;
      const angle = index * 0.5;
      const radius = 20 * Math.sqrt(index);
      node.position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    };

    const flattenTree = (nodeId: string, result: string[] = []) => {
      result.push(nodeId);
      (childrenMap.get(nodeId) || []).forEach((childId) =>
        flattenTree(childId, result)
      );
      return result;
    };

    const flatTree = flattenTree(rootNodeId);
    flatTree.forEach((nodeId, index) => positionNode(nodeId, index));
  };

  switch (layoutType) {
    case 'hierarchical':
      hierarchicalLayout();
      break;
    case 'circular':
      circularLayout();
      break;
    case 'forceDirected':
      forceDirectedLayout();
      break;
    case 'spiral':
      spiralLayout();
      break;
    default:
      hierarchicalLayout();
  }

  return Array.from(nodeMap.values());
};
