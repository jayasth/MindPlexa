import React from 'react';
import { FaCog } from 'react-icons/fa';
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
  onToggleDueDate
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);

  return (
    <div className={styles.taskControls}>
      <div className={styles.taskStats}>
        <span>Total Tasks: {totalTasks}</span>
        <span>Completed Tasks: {completedTasks}</span>
      </div>
      <Dropdown
        onChange={(value) => onSortChange(value)}
        value={sortBy}
        variant="slim"
      >
        <option value="">Sort by</option>
        <option value="priority">Priority</option>
        <option value="dueDate">Due Date</option>
        <option value="status">Status</option>
      </Dropdown>
      <div className={styles.taskOptions}>
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
              Show completed tasks
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskControls;
