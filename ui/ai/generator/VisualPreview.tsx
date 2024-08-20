import React from 'react';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from './VisualPreview.module.css';

interface VisualPreviewProps {
  nodes: Node[];
  edges: Edge[];
}

export const VisualPreview: React.FC<VisualPreviewProps> = ({
  nodes,
  edges
}) => {
  return (
    <div className={styles.visualPreview}>
      <h4 className={styles.previewTitle}>Visual Preview</h4>
      <div className={styles.flowContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          zoomOnScroll={false}
          panOnScroll={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        />
      </div>
    </div>
  );
};
