import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './TaskNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface TaskNodeViewProps extends NodeProps {
  data: {
    title?: string;
    onEdit: () => void;
  };
}

const TaskNodeView: React.FC<TaskNodeViewProps> = ({ data }) => {
  return (
    <div className={styles.taskNode}>
      <div className={styles.header}>
        <span className={styles.title}>{data.title || 'Untitled Tasking'}</span>
        <button className={styles.editButton} onClick={data.onEdit}>
          Edit
        </button>
      </div>
      <div className={styles.taskContent}>
        {/* Tasking content would be rendered here */}
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

export default TaskNodeView;
