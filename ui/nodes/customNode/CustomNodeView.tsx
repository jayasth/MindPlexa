import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './CustomNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface CustomNodeViewProps extends NodeProps {
  data: {
    title?: string;
    onEdit: () => void;
  };
}

const CustomNodeView: React.FC<CustomNodeViewProps> = ({ data }) => {
  return (
    <div className={styles.customNode}>
      <div className={styles.header}>
        <span className={styles.title}>
          {data.title || 'Untitled Customing'}
        </span>
        <button className={styles.editButton} onClick={data.onEdit}>
          Edit
        </button>
      </div>
      <div className={styles.customContent}>
        {/* Customing content would be rendered here */}
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

export default CustomNodeView;
