import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useNodeStore } from '@/app/store';
import styles from './NoteNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

interface NoteNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    content?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  width: number;
  height: number;
}

const NoteNodeView: React.FC<NoteNodeViewProps> = ({ data, width, height }) => {
  const { title, content, id, backgroundColor, textColor } = data;
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);

  return (
    <div
      className={styles.noteNode}
      style={{ width, height, backgroundColor, color: textColor }}
    >
      <div className={styles.header}>
        <div className={styles.title}>{title || 'Untitled Note'}</div>
        <div className={styles.editButton} onClick={() => toggleEditMode(id)}>
          <FaEdit size={12} />
        </div>
      </div>
      <div className={styles.contentPreview}>
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <span className={styles.noContent} style={{ color: textColor }}>
            Click edit to start writing
          </span>
        )}
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
