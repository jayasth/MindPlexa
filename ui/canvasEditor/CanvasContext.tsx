import React, { createContext, useContext } from 'react';
import { useCanvasState } from './hooks/useCanvasState';

// Define the type for the context state
interface CanvasContextType {
  nodes: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  edges: any[];
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onDeleteEdge: (edgeId: string) => void; // Added onDeleteEdge to the context type
}

// Create the context
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);
// Provider component that wraps your app and makes the canvas state available everywhere
export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onDeleteEdge
  } = useCanvasState(); // Included onDeleteEdge from useCanvasState

  return (
    <CanvasContext.Provider
      value={{
        nodes,
        setNodes,
        edges,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onDeleteEdge
      }} // Provided onDeleteEdge through context
    >
      {children}
    </CanvasContext.Provider>
  );
};

// Custom hook to use the canvas context
export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

export default CanvasContext;
