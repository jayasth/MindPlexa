import { useCallback } from 'react';
import { Node, XYPosition } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';

export const useNodeResizing = () => {
  const { updateNode } = useStore((state) => ({
    updateNode: state.updateNode
  }));

  const handleNodeResizeStop = useCallback(
    (
      nodeId: string,
      newSize: { width: number; height: number },
      newPosition: XYPosition
    ) => {
      console.log(
        `useNodeResizing: Resizing node ${nodeId} to width: ${newSize.width}, height: ${newSize.height}, position: ${newPosition.x}, ${newPosition.y}`
      );
      updateNode(nodeId, {
        position: newPosition,
        width: newSize.width,
        height: newSize.height
      });
    },
    [updateNode]
  );

  return { handleNodeResizeStop };
};
