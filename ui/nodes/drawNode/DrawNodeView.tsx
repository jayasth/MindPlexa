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
  const [isLoading, setIsLoading] = useState(true);
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchDrawing = async () => {
      try {
        setIsLoading(true);
        const drawing = await getDrawing(id);

        if (!isMounted) return;

        if (!drawing && retryCount < MAX_RETRIES) {
          retryTimeout = setTimeout(
            () => {
              setRetryCount((prev) => prev + 1);
            },
            Math.pow(2, retryCount) * 1000
          ); // Exponential backoff
          return;
        }

        setDrawingContent(drawing);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching drawing:', error);

        if (!isMounted) return;

        if (retryCount < MAX_RETRIES) {
          retryTimeout = setTimeout(
            () => {
              setRetryCount((prev) => prev + 1);
            },
            Math.pow(2, retryCount) * 1000
          );
        } else {
          setIsLoading(false);
        }
      }
    };

    fetchDrawing();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [id, retryCount]);

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
        {isLoading ? (
          <span className={styles.loading} style={{ color: textColor }}>
            Loading...
          </span>
        ) : drawingContent ? (
          <div className={styles.artboardContainer}>
            <img
              src={drawingContent}
              alt="Drawing"
              className={styles.previewImage}
            />
          </div>
        ) : (
          <span className={styles.noContent} style={{ color: textColor }}>
            Click edit to start drawing
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
