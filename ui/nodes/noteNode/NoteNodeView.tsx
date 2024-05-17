import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './NoteNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

interface NoteNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    content?: string;
  };
  width: number;
  height: number;
}

const NoteNodeView: React.FC<NoteNodeViewProps> = ({ data, width, height }) => {
  const { title, content, id } = data;
  console.log('NoteNodeView: Data received:', data);
  console.log('NoteNodeView: Rendering with title:', data.title);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.noteNode} style={{ width, height }}>
      <div className={styles.header}>
        <span className={styles.title}>{title || 'Untitled Note'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => {
            console.log(`Toggling edit mode for node ID: ${id}`);
            toggleEditMode(id);
          }}
        />
      </div>
      <div className={styles.contentPreview}>{content}</div>
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
