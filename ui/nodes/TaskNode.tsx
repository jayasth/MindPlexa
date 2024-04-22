import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './TaskNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface BaseNodeData {
  id: string;
  canvas_id?: string | null;
  color?: string | null;
  created_at?: string | null;
  height?: number | null;
  position?: any; // Assuming position is a complex type, replace 'any' with the correct type if available
  type?: string | null;
  updated_at?: string | null;
  width?: number | null;
}

interface TaskNodeData extends BaseNodeData {
  completed?: boolean | null;
  task?: string | null;
  title?: string | null;
}

interface TaskNodeProps extends NodeProps {
  data: TaskNodeData;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
  onToggleComplete: () => void;
  id: string;
  selected: boolean;
  type: string;
  zIndex: number;
  isConnectable: boolean;
  xPos: number;
  yPos: number;
  dragging: boolean;
}

const TaskNode: React.FC<TaskNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize,
  onToggleComplete
}) => {
  return (
    <div className={styles.taskNode}>
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
      <div
        style={{
          backgroundColor: data.color || 'transparent',
          width: data.width ? `${data.width}px` : 'auto',
          height: data.height ? `${data.height}px` : 'auto'
        }}
      >
        <div className={styles.taskHeader}>
          <button
            onClick={onDelete}
            className={styles.deleteButton}
            title="Delete Task"
          >
            <FaTrash size={10} />
          </button>
          <button
            onClick={() => onChangeColor(data.color || '#ffffff')}
            className={styles.colorButton}
            title="Change Color"
          >
            <FaPalette size={10} />
          </button>
          <button
            onClick={() => onResize(data.width ?? 100, data.height ?? 50)}
            className={styles.resizeButton}
            title="Resize Task"
          >
            <FaExpand size={10} />
          </button>
        </div>
        <label className={styles.taskLabel}>
          <input
            type="checkbox"
            checked={data.completed || false}
            onChange={onToggleComplete}
            className={styles.taskCheckbox}
          />
          <span className={styles.taskText}>
            {data.task || 'No task description'}
          </span>
        </label>
      </div>
      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default TaskNode;
