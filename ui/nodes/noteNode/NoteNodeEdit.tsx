import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
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
  width: number;
  height: number;
}

const NoteNodeEdit: React.FC<NoteNodeEditProps> = ({ data, width, height }) => {
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.noteNode} style={{ width, height }}>
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
        <button
          className={styles.cancelButton}
          onClick={() => {
            console.log(`Toggling edit mode off for node ID: ${data.id}`);
            toggleEditMode(data.id);
          }}
        >
          Cancel
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
