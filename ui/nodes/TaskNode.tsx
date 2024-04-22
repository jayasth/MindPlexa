import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import taskStyles from './TaskNode.module.css';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import baseStyles from './BaseNode.module.css';

interface BaseNodeData {
  id: string;
  canvas_id?: string | null;
  color?: string | null;
  created_at?: string | null;
  height?: number | null;
  position?: any;
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
  onChangeColor: () => void;
  onResize: () => void;
  onTag: () => void;
  onAttach: () => void;
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
  onTag,
  onAttach,
  onToggleComplete,
  selected,
  id,
  type,
  zIndex,
  isConnectable,
  xPos,
  yPos,
  dragging
}) => {
  return (
    <div className={baseStyles.baseNode}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <BaseNodeHeader
        title={data.title || 'Untitled Tasklist'}
        onDelete={onDelete}
      />
      <label className={taskStyles.taskLabel}>
        {' '}
        {/* Apply task-specific styles */}
        <input
          type="checkbox"
          checked={data.completed || false}
          onChange={onToggleComplete}
          className={taskStyles.taskCheckbox}
        />
        <span className={taskStyles.taskText}>
          {data.task || 'No task description'}
        </span>
      </label>
      <BaseNodeFooter
        onChangeColor={onChangeColor}
        onResize={onResize}
        onTag={onTag}
        onAttach={onAttach}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default TaskNode;
