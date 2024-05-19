import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './NoteNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';

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
  const { title, content, id, backgroundColor } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const updateNode = useStore((state) => state.updateNode);

  const [textColor, setTextColor] = useState(
    data.textColor || getContrastYIQ(backgroundColor || '#F4F4F4')
  );

  // Ensure text color is updated based on the latest background color
  useEffect(() => {
    const newTextColor = getContrastYIQ(backgroundColor || '#F4F4F4');
    if (textColor !== newTextColor) {
      setTextColor(newTextColor);
      updateNode(id, { data: { ...data, textColor: newTextColor } });
    }
  }, [backgroundColor, textColor, id, updateNode, data]);

  return (
    <div className={styles.noteNode} style={{ width, height, backgroundColor }}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title || 'Untitled Note'}
        </div>
        <div
          className={styles.editButton}
          style={{ color: textColor }}
          onClick={() => toggleEditMode(id)}
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
