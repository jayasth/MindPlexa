import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './TaskNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface TaskNodeEditProps extends NodeProps {
  data: {
    id: string;
    task?: string;
    completed?: boolean;
    title?: string;
    onSave: () => void;
    onToggleComplete: () => void;
    onChangeTask: (task: string) => void;
    Task: (task: string) => void;
  };
}

const TaskNodeEdit: React.FC<TaskNodeEditProps> = ({ data }) => {
  return (
    <div className={styles.taskNode}>
      <div className={styles.header}>
        <input
          type="text"
          value={data.title || 'Untitled Task'}
          onChange={(e) => console.log('Update title:', e.target.value)}
          className={styles.titleInput}
        />
        <button className={styles.saveButton} onClick={data.onSave}>
          Save
        </button>
      </div>
      <div className={styles.taskContent}>
        <label className={styles.taskLabel}>
          <input
            type="checkbox"
            checked={data.completed || false}
            onChange={data.onToggleComplete}
            className={styles.taskCheckbox}
          />
          <input
            type="text"
            value={data.task || ''}
            onChange={(e) => data.onChangeTask(e.target.value)}
            className={styles.taskTextInput}
          />
        </label>
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

export default TaskNodeEdit;
