import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CodeNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

interface CodeNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
  };
  width: number;
  height: number;
}

const CodeNodeView: React.FC<CodeNodeViewProps> = ({ data, width, height }) => {
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.codeNode} style={{ width, height }}>
      <div className={styles.header}>
        <span className={styles.title}>{data.title || 'Untitled Code'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => {
            console.log(`Toggling edit mode for node ID: ${data.id}`);
            toggleEditMode(data.id);
          }}
        />
      </div>
      <div className={styles.codeContent}>
        {/* Code content would be rendered here */}
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

export default CodeNodeView;
