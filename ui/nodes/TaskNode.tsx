// ui/nodes/TaskNode.tsx
import React from 'react';
import styles from './TaskNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface TaskNodeProps {
  task: string;
  completed: boolean;
  onToggleComplete: () => void;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
  color: string; // new prop
  width: number; // new prop
  height: number; // new prop
}

const TaskNode: React.FC<TaskNodeProps> = ({
  task,
  completed,
  onToggleComplete,
  onDelete,
  onChangeColor,
  onResize,
  color, // new prop
  width, // new prop
  height // new prop
}) => {
  return (
    <div className={styles.taskNode}>
      <div className={styles.taskHeader}>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Task"
        >
          <FaTrash size="10" />
        </button>
        <button
          onClick={() => onChangeColor(color)} // use color prop
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size="10" />
        </button>
        <button
          onClick={() => onResize(width, height)} // use width and height props
          className={styles.resizeButton}
          title="Resize Task"
        >
          <FaExpand size="10" />
        </button>
      </div>
      <label className={styles.taskLabel}>
        <input
          type="checkbox"
          checked={completed}
          onChange={onToggleComplete}
          className={styles.taskCheckbox}
        />
        <span className={styles.taskText}>{task}</span>
      </label>
    </div>
  );
};

export default TaskNode;
