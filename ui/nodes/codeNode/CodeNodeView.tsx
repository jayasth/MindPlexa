import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './CodeNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface CodeNodeViewProps extends NodeProps {
  data: {
    title?: string;
    onEdit: () => void;
  };
}

const CodeNodeView: React.FC<CodeNodeViewProps> = ({ data }) => {
  return (
    <div className={styles.codeNode}>
      <div className={styles.header}>
        <span className={styles.title}>{data.title || 'Untitled Codeing'}</span>
        <button className={styles.editButton} onClick={data.onEdit}>
          Edit
        </button>
      </div>
      <div className={styles.codeContent}>
        {/* Coding content would be rendered here */}
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
