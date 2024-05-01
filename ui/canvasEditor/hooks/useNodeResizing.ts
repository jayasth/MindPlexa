import { useCallback } from 'react';
import { Node, XYPosition } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';

export const useNodeResizing = () => {
  const { setNodes } = useStore((state) => ({
    setNodes: state.setNodes
  }));

  const handleNodeResizeStop = useCallback(
    (
      nodeId: string,
      newSize: { width: number; height: number },
      newPosition: XYPosition
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
    [setNodes]
  );

  return { handleNodeResizeStop };
};
