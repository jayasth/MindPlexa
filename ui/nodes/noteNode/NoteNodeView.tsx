import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './NoteNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface NoteNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
  };
}

const NoteNodeView: React.FC<NoteNodeViewProps> = ({ data }) => {
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.noteNode}>
      <div className={styles.header}>
        <span className={styles.title}>{data.title || 'Untitled Note'}</span>
        <button
          className={styles.editButton}
          onClick={() => {
            console.log(`Toggling edit mode for node ID: ${data.id}`);
            toggleEditMode(data.id);
          }}
        >
          Edit
        </button>
      </div>
      <div className={styles.noteContent}>
        {/* Note content would be rendered here */}
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
