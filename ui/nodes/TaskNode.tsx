import React from 'react';
import { NodeProps } from 'reactflow';
import styles from './TaskNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface TaskNodeData {
  task?: string;
  completed?: boolean;
  color?: string;
  width?: number;
  height?: number;
}

interface TaskNodeProps extends NodeProps {
  data: TaskNodeData;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
  onToggleComplete: () => void;
}

const TaskNode: React.FC<TaskNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize,
  onToggleComplete
}) => {
  return (
    <div
      className={styles.taskNode}
      style={{
        backgroundColor: data.color || 'transparent',
        width: data.width || 'auto',
        height: data.height || 'auto'
      }}
    >
      <div className={styles.taskHeader}>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Task"
        >
          <FaTrash size={10} />
        </button>
        <button
          onClick={() => onChangeColor(data.color || '#ffffff')}
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size={10} />
        </button>
        <button
          onClick={() => onResize(data.width ?? 100, data.height ?? 50)}
          className={styles.resizeButton}
          title="Resize Task"
        >
          <FaExpand size={10} />
        </button>
      </div>
      <label className={styles.taskLabel}>
        <input
          type="checkbox"
          checked={data.completed || false}
          onChange={onToggleComplete}
          className={styles.taskCheckbox}
        />
        <span className={styles.taskText}>
          {data.task || 'No task description'}
        </span>
      </label>
    </div>
  );
};

export default TaskNode;
