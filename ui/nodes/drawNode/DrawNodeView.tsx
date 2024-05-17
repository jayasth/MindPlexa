import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './DrawNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

interface DrawNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    drawing?: string;
  };
  width: number;
  height: number;
}

const DrawNodeView: React.FC<DrawNodeViewProps> = ({ data, width, height }) => {
  const { title, drawing, id } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.drawNode} style={{ width, height }}>
      <div className={styles.header}>
        <span className={styles.title}>{title || 'Untitled Drawing'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => toggleEditMode(id)}
        />
      </div>
      <div className={styles.contentPreview}>
        {drawing ? (
          <img src={drawing} alt="Drawing" className={styles.drawing} />
        ) : (
          <span>No drawing available</span>
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
