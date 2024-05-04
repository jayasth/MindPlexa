import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './CustomNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface CustomNodeEditProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    data?: any;
    onSave: () => void;
    onChangeData: (data: any) => void;
  };
}

const CustomNodeEdit: React.FC<CustomNodeEditProps> = ({ data }) => {
  return (
    <div className={styles.customNode}>
      <div className={styles.header}>
        <input
          type="text"
          value={data.title || 'Untitled Custom Node'}
          onChange={(e) => console.log('Update title:', e.target.value)}
          className={styles.titleInput}
        />
        <button className={styles.saveButton} onClick={data.onSave}>
          Save
        </button>
      </div>
      <textarea
        className={styles.customContent}
        value={JSON.stringify(data.data, null, 2)}
        onChange={(e) => data.onChangeData(JSON.parse(e.target.value))}
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

export default CustomNodeEdit;
