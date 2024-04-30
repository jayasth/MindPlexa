import { useCallback, useRef } from 'react';
import { Node } from 'reactflow';
import debounce from 'lodash.debounce';

export const useNodeResizing = (
  setNodes: (func: (nodes: Node[]) => Node[]) => void
) => {
  const debouncedSetNodes = useRef(
    debounce((newSize: { width: number; height: number }, nodeId: string) => {
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
    }, 150) // Debounce period in milliseconds
  ).current;

  const handleNodeResizeStop = useCallback(
    (nodeId: string, newSize: { width: number; height: number }) => {
      debouncedSetNodes(newSize, nodeId);
    },
    [debouncedSetNodes]
  );

  return { handleNodeResizeStop };
};
