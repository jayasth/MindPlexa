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
    formFields?: { type: string; label: string; value: any }[];
  };
  width: number;
  height: number;
}

const CustomNodeView: React.FC<CustomNodeViewProps> = ({
  data,
  width,
  height
}) => {
  const { title, formFields, id } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.customNode} style={{ width, height }}>
      <div className={styles.header}>
        <span className={styles.title}>{title || 'Untitled Custom Node'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => toggleEditMode(id)}
        />
      </div>
      <div className={styles.contentPreview}>
        {formFields?.map((field, index) => (
          <div key={index} className={styles.formField}>
            <span className={styles.fieldLabel}>{field.label}:</span>
            <span className={styles.fieldValue}>{field.value}</span>
          </div>
        ))}
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
