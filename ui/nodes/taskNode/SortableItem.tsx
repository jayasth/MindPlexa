import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTimes } from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import Dropdown from '@/ui/dropdown/Dropdown';
import Input from '@/ui/Input/Input';
import styles from './TaskNodeEdit.module.css';

interface SortableItemProps {
  id: string;
  task: {
    id: string;
    text: string;
    completed: boolean;
    priority: string;
    due_date: string | null;
  };
  updateTask: (
    taskId: string,
    updates: Partial<SortableItemProps['task']>
  ) => void;
  deleteTask: (taskId: string) => void;
  textColor: string;
  showPriority: boolean;
  showDueDate: boolean;
}

export function SortableItem({
  id,
  task,
  updateTask,
  deleteTask,
  textColor,
  showPriority,
  showDueDate
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    color: textColor,
    textDecoration: task.completed ? 'line-through' : 'none',
    opacity: task.completed ? 0.6 : 1
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
        onChange={() => updateTask(task.id, { completed: !task.completed })}
        className={styles.taskCheckbox}
      />
      <Input
        type="text"
        value={task.text}
        onChange={(value) => updateTask(task.id, { text: value })}
        className={styles.taskInput}
        style={{ color: textColor }}
        variant="slim"
      />
      {showPriority && (
        <Dropdown
          value={task.priority}
          onChange={(value) => updateTask(task.id, { priority: value })}
          className={styles.taskPriority}
          variant="slim"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Dropdown>
      )}
      {showDueDate && (
        <Input
          type="date"
          value={task.due_date || ''}
          onChange={(value) => updateTask(task.id, { due_date: value })}
          className={styles.taskDueDate}
          variant="slim"
        />
      )}
      <button
        onClick={() => deleteTask(task.id)}
        className={styles.deleteTaskButton}
      >
        <FaTimes />
      </button>
      <div {...listeners} className={styles.dragHandle}>
        <MdDragIndicator />
      </div>
    </div>
  );
}
