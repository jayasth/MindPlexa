import { useCallback } from 'react';
import { Node } from 'reactflow';

export const useNodeResizing = (
  setNodes: (func: (nodes: Node[]) => Node[]) => void
) => {
  const handleNodeResizeStop = useCallback(
    (nodeId: string, newSize: { width: number; height: number }) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  width: newSize.width,
                  height: newSize.height
                },
                style: { width: newSize.width, height: newSize.height }
              }
            : node
        )
      );
    },
    [setNodes]
  );

  return { handleNodeResizeStop };
};
