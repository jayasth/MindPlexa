import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './TaskNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

interface TaskNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    tasks?: { text: string; completed: boolean }[];
  };
  width: number;
  height: number;
}

const TaskNodeView: React.FC<TaskNodeViewProps> = ({ data, width, height }) => {
  const { title, tasks, id } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <div className={styles.taskNode} style={{ width, height }}>
      <div className={styles.header}>
        <span className={styles.title}>{title || 'Untitled Task'}</span>
        <FaEdit
          className={styles.editButton}
          onClick={() => toggleEditMode(id)}
        />
      </div>
      <div className={styles.contentPreview}>
        {tasks?.map((task, index) => (
          <div key={index} className={styles.taskItem}>
            <input type="checkbox" checked={task.completed} readOnly />
            <span className={task.completed ? styles.completedTask : ''}>
              {task.text}
            </span>
          </div>
        ))}
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
