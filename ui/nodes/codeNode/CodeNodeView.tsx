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
    code?: string;
    language?: string;
  };
  width: number;
  height: number;
}

const CodeNodeView: React.FC<CodeNodeViewProps> = ({ data, width, height }) => {
  const { title, code, language, id } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.codeNode} style={{ width, height }}>
      <div className={styles.header}>
        <span className={styles.title}>{title || 'Untitled Code'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => toggleEditMode(id)}
        />
      </div>
      <div className={styles.contentPreview}>
        <pre className={styles.codeBlock}>
          <code>{code}</code>
        </pre>
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
