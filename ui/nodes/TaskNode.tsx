// ui/nodes/TaskNode.tsx
import React from 'react';
import styles from './TaskNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';
import { Tables } from 'types_db';

interface TaskNodeProps {
  node: Tables<'task_nodes'>;
  task: string | null; // Adjusted for possible null
  completed: boolean | null; // Adjusted for possible null
  onToggleComplete: () => void;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
  color: string | null; // Adjusted for possible null
  width: number | null; // Adjusted for possible null
  height: number | null; // Adjusted for possible null
}

const TaskNode: React.FC<TaskNodeProps> = ({
  task,
  completed,
  onToggleComplete,
  onDelete,
  onChangeColor,
  onResize,
  color,
  width,
  height
}) => {
  // Providing default values for nullable props
  const safeColor = color || 'defaultColor'; // Replace 'defaultColor' with an actual default color if needed
  const safeWidth = width || 100; // Default width if null
  const safeHeight = height || 100; // Default height if null
  const safeTask = task || ''; // Default task text if null
  const isCompleted = !!completed; // Converts null to false

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
          onClick={() => onChangeColor(safeColor)} // Using safeColor
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size="10" />
        </button>
        <button
          onClick={() => onResize(safeWidth, safeHeight)} // Using safeWidth and safeHeight
          className={styles.resizeButton}
          title="Resize Task"
        >
          <FaExpand size="10" />
        </button>
      </div>
      <label className={styles.taskLabel}>
        <input
          type="checkbox"
          checked={isCompleted} // Using isCompleted
          onChange={onToggleComplete}
          className={styles.taskCheckbox}
        />
        <span className={styles.taskText}>{safeTask}</span>{' '}
        {/* Using safeTask */}
      </label>
    </div>
  );
};

export default TaskNode;
