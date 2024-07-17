import React from 'react';
import { FaCog } from 'react-icons/fa';
import styles from './TaskNodeEdit.module.css';

interface TaskOptionsProps {
  showCompletedTasks: boolean;
  showPriority: boolean;
  showDueDate: boolean;
  onToggleCompletedTasks: () => void;
  onTogglePriority: () => void;
  onToggleDueDate: () => void;
}

const TaskOptions: React.FC<TaskOptionsProps> = ({
  showCompletedTasks,
  showPriority,
  showDueDate,
  onToggleCompletedTasks,
  onTogglePriority,
  onToggleDueDate
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={styles.taskOptions}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.iconButton}>
        <FaCog />
      </button>
      {isOpen && (
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
  );
};

export default TaskOptions;
