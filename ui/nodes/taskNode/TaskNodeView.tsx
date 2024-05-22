import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './TaskNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';

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
  const { title, tasks, id, backgroundColor } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const updateNode = useStore((state) => state.updateNode);

  const [textColor, setTextColor] = useState(
    data.textColor || getContrastYIQ(backgroundColor || '#F4F4F4')
  );

  useEffect(() => {
    const newTextColor = getContrastYIQ(backgroundColor || '#F4F4F4');
    if (textColor !== newTextColor) {
      setTextColor(newTextColor);
      updateNode(id, { data: { ...data, textColor: newTextColor } });
    }
  }, [backgroundColor, textColor, id, updateNode, data]);

  return (
    <div className={styles.taskNode} style={{ width, height, backgroundColor }}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title || 'Untitled Task'}
        </div>
        <div
          className={styles.editButton}
          style={{ color: textColor }}
          onClick={() => toggleEditMode(data.id)}
        >
          <FaEdit />
        </div>
      </div>
      <div className={styles.taskList} style={{ color: textColor }}>
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <input type="checkbox" checked={task.completed} readOnly />
              <span>{task.text}</span>
            </div>
          ))
        ) : (
          <span className={styles.noTasks} style={{ color: textColor }}>
            No tasks available
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
