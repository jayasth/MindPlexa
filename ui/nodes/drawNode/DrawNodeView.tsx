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
  const [isLoading, setIsLoading] = useState(false);
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchDrawing = async () => {
      try {
        const drawing = await getDrawing(id);

        if (!isMounted) return;

        if (!drawing && retryCount === 0) {
          setIsLoading(false);
          return;
        }

        if (drawing || retryCount > 0) {
          setIsLoading(true);
        }

        if (!drawing && retryCount < MAX_RETRIES) {
          retryTimeout = setTimeout(
            () => {
              setRetryCount((prev) => prev + 1);
            },
            Math.pow(2, retryCount) * 1000
          );
          return;
        }

        setDrawingContent(drawing);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching drawing:', error);

        if (!isMounted) return;

        if (retryCount > 0 && retryCount < MAX_RETRIES) {
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <span className={styles.loading} style={{ color: textColor }}>
          Loading...
        </span>
      );
    }

    if (drawingContent) {
      return (
        <div className={styles.artboardContainer}>
          <img
            src={drawingContent}
            alt="Drawing"
            className={styles.previewImage}
          />
        </div>
      );
    }

    return (
      <span className={styles.noContent} style={{ color: textColor }}>
        Click edit to start drawing
      </span>
    );
  };

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
      <div className={styles.contentPreview}>{renderContent()}</div>
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
