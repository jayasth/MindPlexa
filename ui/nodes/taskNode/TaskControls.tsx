import React, { useState, useRef, useEffect } from 'react';
import { FaCog, FaTrash } from 'react-icons/fa';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from './TaskNodeEdit.module.css';

interface TaskControlsProps {
  totalTasks: number;
  completedTasks: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  showCompletedTasks: boolean;
  showPriority: boolean;
  showDueDate: boolean;
  onToggleCompletedTasks: () => void;
  onTogglePriority: () => void;
  onToggleDueDate: () => void;
  onDeleteCompletedTasks: () => void;
  onDeleteAllTasks: () => void;
}

const TaskControls: React.FC<TaskControlsProps> = ({
  totalTasks,
  completedTasks,
  sortBy,
  onSortChange,
  showCompletedTasks,
  showPriority,
  showDueDate,
  onToggleCompletedTasks,
  onTogglePriority,
  onToggleDueDate,
  onDeleteCompletedTasks,
  onDeleteAllTasks
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.taskControls}>
      <div className={styles.taskStats}>
        <span>Total: {totalTasks}</span>
        <span>Completed: {completedTasks}</span>
      </div>
      <Dropdown
        onChange={(value) => onSortChange(value)}
        value={sortBy}
        variant="slim"
        className={styles.sortDropdown}
      >
        <option value="">Sort by</option>
        <option value="priority">Priority</option>
        <option value="dueDate">Due Date</option>
        <option value="alphabetical">Alphabetical</option>
      </Dropdown>
      <div className={styles.taskOptions} ref={optionsRef}>
        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className={styles.iconButton}
        >
          <FaCog />
        </button>
        {isOptionsOpen && (
          <div className={styles.optionsMenu}>
            <label>
              <input
                type="checkbox"
                checked={showCompletedTasks}
                onChange={onToggleCompletedTasks}
              />
              Show completed
            </label>
            <label>
              <input
                type="checkbox"
                checked={showPriority}
                onChange={onTogglePriority}
              />
              Show priority
            </label>
            <label>
              <input
                type="checkbox"
                checked={showDueDate}
                onChange={onToggleDueDate}
              />
              Show due date
            </label>
            <button
              onClick={onDeleteCompletedTasks}
              className={styles.cleanupButton}
            >
              <FaTrash /> Delete Completed
            </button>
            <button onClick={onDeleteAllTasks} className={styles.cleanupButton}>
              <FaTrash /> Delete All Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskControls;
