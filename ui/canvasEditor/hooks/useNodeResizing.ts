import { useCallback, useRef } from 'react';
import { Node, XYPosition } from 'reactflow';
import debounce from 'lodash.debounce';

export const useNodeResizing = (
  setNodes: (func: (nodes: Node[]) => Node[]) => void
) => {
  const debouncedSetNodes = useRef(
    debounce(
      (
        newSize: { width: number; height: number },
        newPosition: XYPosition,
        nodeId: string
      ) => {
        setNodes((currentNodes) =>
          currentNodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  position: newPosition,
                  width: newSize.width,
                  height: newSize.height
                }
              : node
          )
        );
      },
      500
    ) // Debounce period in milliseconds
  ).current;

  const handleNodeResizeStop = useCallback(
    (
      nodeId: string,
      newSize: { width: number; height: number },
      newPosition: XYPosition
    ) => {
      debouncedSetNodes(newSize, newPosition, nodeId);
    },
    [debouncedSetNodes]
  );

  return { handleNodeResizeStop };
};
