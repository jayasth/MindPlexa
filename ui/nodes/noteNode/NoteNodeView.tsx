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
  };
  width: number;
  height: number;
}

const NoteNodeView: React.FC<NoteNodeViewProps> = ({ data, width, height }) => {
  const { title, content, id } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return 'black'; // Default to black if hexcolor is undefined
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? 'black' : 'white';
  };

  const textColor = getContrastYIQ(data.backgroundColor);

  return (
    <div
      className={styles.noteNode}
      style={{
        width,
        height,
        backgroundColor: data.backgroundColor,
        color: textColor
      }}
    >
      <div className={styles.header}>
        <span className={styles.title}>{title || 'Untitled Note'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => toggleEditMode(id)}
          style={{ color: textColor }}
        />
      </div>
      <div className={styles.contentPreview}>
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <span className={styles.noContent}>No content available</span>
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
