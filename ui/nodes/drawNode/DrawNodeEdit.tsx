import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './DrawNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface DrawNodeEditProps extends NodeProps {
  data: {
    title?: string;
    width: number;
    height: number;
    onSave: () => void;
    onChangeColor: () => void;
    onTag: () => void;
    onAttach: () => void;
  };
}

const DrawNodeEdit: React.FC<DrawNodeEditProps> = ({ data }) => {
  return (
    <div className={styles.drawNode}>
      <div className={styles.header}>
        <input
          type="text"
          value={data.title || 'Untitled Drawing'}
          onChange={(e) => console.log('Update title:', e.target.value)}
          className={styles.titleInput}
        />
        <button className={styles.saveButton} onClick={data.onSave}>
          Save
        </button>
      </div>
      <div className={styles.drawContent}>
        {/* Drawing content would be rendered here */}
      </div>
      <div className={styles.footer}>
        <button className={styles.iconButton} onClick={data.onChangeColor}>
          Change Color
        </button>
        <button className={styles.iconButton} onClick={data.onTag}>
          Tag
        </button>
        <button className={styles.iconButton} onClick={data.onAttach}>
          Attach
        </button>
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

export default DrawNodeEdit;
