import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './CodeNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface CodeNodeEditProps extends NodeProps {
  data: {
    id: string;
    code?: string;
    language?: string;
    title?: string;
    onSave: () => void;
    onChange: (code: string) => void;
  };
}

const CodeNodeEdit: React.FC<CodeNodeEditProps> = ({ data }) => {
  return (
    <div className={styles.codeNode}>
      <div className={styles.header}>
        <input
          type="text"
          value={data.title || 'Untitled Code'}
          onChange={(e) => console.log('Update title:', e.target.value)}
          className={styles.titleInput}
        />
        <button className={styles.saveButton} onClick={data.onSave}>
          Save
        </button>
      </div>
      <textarea
        className={styles.codeContent}
        value={data.code || ''}
        onChange={(e) => data.onChange(e.target.value)}
      />
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

export default CodeNodeEdit;
