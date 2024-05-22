import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTimes } from 'react-icons/fa';
import styles from './TaskNodeEdit.module.css';

interface SortableItemProps {
  id: string;
  task: {
    id: string;
    text: string;
    completed: boolean;
  };
  updateTaskText: (taskId: string, text: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  textColor: string;
}

export function SortableItem({
  id,
  task,
  updateTaskText,
  toggleTaskCompletion,
  deleteTask,
  textColor
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    color: textColor
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={styles.taskItem}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTaskCompletion(task.id)}
        className={styles.taskCheckbox}
      />
      <input
        type="text"
        value={task.text}
        onChange={(e) => updateTaskText(task.id, e.target.value)}
        className={styles.taskInput}
        style={{ color: textColor }}
      />
      <button
        onClick={() => deleteTask(task.id)}
        className={styles.deleteTaskButton}
      >
        <FaTimes />
      </button>
      <div {...listeners} className={styles.dragHandle} />
    </div>
  );
}
