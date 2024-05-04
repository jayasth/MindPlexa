import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './NoteNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface NoteNodeViewProps extends NodeProps {
  data: {
    title?: string;
    onEdit: () => void;
  };
}

const NoteNodeView: React.FC<NoteNodeViewProps> = ({ data }) => {
  return (
    <div className={styles.noteNode}>
      <div className={styles.header}>
        <span className={styles.title}>{data.title || 'Untitled Noteing'}</span>
        <button className={styles.editButton} onClick={data.onEdit}>
          Edit
        </button>
      </div>
      <div className={styles.noteContent}>
        {/* Noting content would be rendered here */}
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

export default NoteNodeView;
