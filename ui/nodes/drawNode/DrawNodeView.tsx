import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useNodeStore } from '@/app/store';
import styles from './DrawNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { getDrawing } from '@/utils/canvas/drawNodeService';

interface DrawNodeViewProps extends NodeProps {
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

const DrawNodeView: React.FC<DrawNodeViewProps> = ({ data, width, height }) => {
  const { title, id, backgroundColor, textColor } = data;
  const [drawingContent, setDrawingContent] = useState<string | null>(null);
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);

  useEffect(() => {
    const fetchDrawing = async () => {
      const drawing = await getDrawing(id);
      setDrawingContent(drawing);
    };

    fetchDrawing();
  }, [id]);

  return (
    <div className={styles.drawNode} style={{ width, height, backgroundColor }}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title || 'Untitled Draw'}
        </div>
        <div
          className={styles.editButton}
          style={{ color: textColor }}
          onClick={() => toggleEditMode(id)}
        >
          <FaEdit />
        </div>
      </div>
      <div className={styles.contentPreview}>
        {drawingContent ? (
          <div className={styles.artboardContainer}>
            <img
              src={drawingContent}
              alt="Drawing"
              className={styles.previewImage}
            />
          </div>
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

export default DrawNodeView;
