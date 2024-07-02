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
    backgroundColor?: string;
    textColor?: string;
  };
  width: number;
  height: number;
}

const NoteNodeView: React.FC<NoteNodeViewProps> = ({ data, width, height }) => {
  const { title, content, id, backgroundColor, textColor } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  console.log('NOteNodeView: Node ID:', data.id);

  return (
    <div className={styles.noteNode} style={{ width, height, backgroundColor }}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title || 'Untitled Note'}
        </div>
        <div
          className={styles.editButton}
          style={{ color: textColor }}
          onClick={() => toggleEditMode(data.id)}
        >
          <FaEdit />
        </div>
      </div>
      <div className={styles.contentPreview} style={{ color: textColor }}>
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <span className={styles.noContent} style={{ color: textColor }}>
            No content available
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
