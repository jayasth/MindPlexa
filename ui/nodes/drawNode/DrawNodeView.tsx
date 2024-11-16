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
  const [retryCount, setRetryCount] = useState(0);
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchDrawing = async () => {
      try {
        const drawing = await getDrawing(id);
        if (isMounted) {
          if (drawing) {
            setDrawingContent(drawing);
            setIsLoading(false);
          } else if (retryCount < maxRetries) {
            // If no drawing found, retry after delay
            retryTimeout = setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, retryDelay);
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        if (!(error instanceof Error && error.message.includes('404'))) {
          console.error('Error fetching drawing:', error);
        }
        if (isMounted && retryCount < maxRetries) {
          retryTimeout = setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, retryDelay);
        } else {
          setIsLoading(false);
        }
      }
    };

    fetchDrawing();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [id, retryCount]);

  // Refresh content when switching back to view mode
  useEffect(() => {
    const refreshDrawing = async () => {
      setIsLoading(true);
      try {
        const drawing = await getDrawing(id);
        if (drawing) {
          setDrawingContent(drawing);
        }
      } catch (error) {
        console.error('Error refreshing drawing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    refreshDrawing();
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
              onError={() => {
                // If image fails to load, try refreshing
                if (retryCount < maxRetries) {
                  setRetryCount((prev) => prev + 1);
                }
              }}
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
