import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './DrawNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface DrawNodeViewProps extends NodeProps {
  data: {
    title?: string;
    onEdit: () => void;
  };
}

const DrawNodeView: React.FC<DrawNodeViewProps> = ({ data }) => {
  return (
    <div className={styles.drawNode}>
      <div className={styles.header}>
        <span className={styles.title}>{data.title || 'Untitled Drawing'}</span>
        <button className={styles.editButton} onClick={data.onEdit}>
          Edit
        </button>
      </div>
      <div className={styles.drawContent}>
        {/* Drawing content would be rendered here */}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleTop}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default DrawNodeView;
