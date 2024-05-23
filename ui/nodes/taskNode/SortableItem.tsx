import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTimes, FaGripLines } from 'react-icons/fa';
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
    color: textColor,
    textDecoration: task.completed ? 'line-through' : 'none', // Add strikethrough for completed tasks
    opacity: task.completed ? 0.6 : 1 // Reduce opacity for completed tasks
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
        className="appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-lavender-500 checked:border-lavender-600 focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer"
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
      <div {...listeners} className={styles.dragHandle}>
        <FaGripLines />
      </div>
    </div>
  );
}
