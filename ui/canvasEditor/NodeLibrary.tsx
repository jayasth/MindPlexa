// ui/canvasEditor/NodeLibrary.tsx
import React from 'react';
import styles from './NodeLibrary.module.css';

interface NodeLibraryProps {
  nodes: any[];
  onNodeSelect: (node: any) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ nodes, onNodeSelect }) => {
  return (
    <div className={styles.nodeLibrary}>
      <h3 className={styles.libraryTitle}>Node Library</h3>
      {/* Categorize and filter nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={styles.nodeItem}
          onClick={() => onNodeSelect(node)}
        >
          {node.type}
        </div>
      ))}
    </div>
  );
};

export default NodeLibrary;
