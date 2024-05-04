import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './NoteNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface NoteNodeEditProps extends NodeProps {
  data: {
    id: string;
    content?: string;
    title?: string;
    onSave: () => void;
    onChangeContent: (content: string) => void;
  };
}

const NoteNodeEdit: React.FC<NoteNodeEditProps> = ({ data }) => {
  return (
    <div className={styles.noteNode}>
      <div className={styles.header}>
        <input
          type="text"
          value={data.title || 'Untitled Note'}
          onChange={(e) => console.log('Update title:', e.target.value)}
          className={styles.titleInput}
        />
        <button className={styles.saveButton} onClick={data.onSave}>
          Save
        </button>
      </div>
      <textarea
        className={styles.noteContent}
        value={data.content || ''}
        onChange={(e) => data.onChangeContent(e.target.value)}
      />
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

export default NoteNodeEdit;
