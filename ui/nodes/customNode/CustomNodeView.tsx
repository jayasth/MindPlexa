import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CustomNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

interface CustomNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
  };
  width: number;
  height: number;
}

const CustomNodeView: React.FC<CustomNodeViewProps> = ({
  data,
  width,
  height
}) => {
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.customNode} style={{ width, height }}>
      <div className={styles.header}>
        <span className={styles.title}>{data.title || 'Untitled Custom'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => {
            console.log(`Toggling edit mode for node ID: ${data.id}`);
            toggleEditMode(data.id);
          }}
        />
      </div>
      <div className={styles.customContent}>
        {/* Custom content would be rendered here */}
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

export default CustomNodeView;
