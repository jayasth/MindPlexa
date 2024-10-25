import React, { useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useNodeStore, useUIStore } from '@/app/store';
import styles from './TaskNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

interface TaskNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    tasks?: { id: string; text: string; completed: boolean }[];
    backgroundColor?: string;
    textColor?: string;
  };
  width: number;
  height: number;
}

const TaskNodeView: React.FC<TaskNodeViewProps> = ({ data, width, height }) => {
  const { id, title, tasks, backgroundColor, textColor } = data;
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const isLoading = useUIStore((state) => state.isLoading);

  useEffect(() => {
    console.log('TaskNodeView: Node details:', {
      id,
      title,
      tasks,
      backgroundColor,
      textColor,
      width,
      height
    });
  }, [id, title, tasks, backgroundColor, textColor, width, height]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.taskNode} style={{ width, height, backgroundColor }}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title || 'Untitled Task'}
        </div>
        <div
          className={styles.editButton}
          style={{ color: textColor }}
          onClick={() => toggleEditMode(id)}
        >
          <FaEdit />
        </div>
      </div>
      <div className={styles.tasksPreview} style={{ color: textColor }}>
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <input type="checkbox" checked={task.completed} readOnly />
              <span>{task.text}</span>
            </div>
          ))
        ) : (
          <span className={styles.noContent} style={{ color: textColor }}>
            Click edit to add tasks
          </span>
        )}
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

export default TaskNodeView;
