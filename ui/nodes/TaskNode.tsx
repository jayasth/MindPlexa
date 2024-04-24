import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import taskStyles from './TaskNode.module.css';
import baseStyles from './BaseNode.module.css';

interface TaskNodeData {
  id: string;
  task?: string;
  completed?: boolean;
  title?: string;
  width?: number;
  height?: number;
}

interface TaskNodeProps extends NodeProps {
  data: TaskNodeData;
  onDelete: () => void;
  onChangeColor: () => void;
  onTag: () => void;
  onAttach: () => void;
  onToggleComplete: () => void;
}

const TaskNode: React.FC<TaskNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onTag,
  onAttach,
  onToggleComplete
}) => {
  const [size, setSize] = useState({
    width: data.width || 200,
    height: data.height || 300
  });

  useEffect(() => {
    if (data.width && data.height) {
      setSize({ width: data.width, height: data.height });
    }
  }, [data.width, data.height]);

  return (
    <div
      className={`${baseStyles.baseNode} resizable`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        resize: 'both',
        overflow: 'auto'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <BaseNodeHeader
        title={data.title || 'Untitled Task'}
        onDelete={onDelete}
      />
      <div className={taskStyles.taskContent}>
        <label className={taskStyles.taskLabel}>
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
      </div>
      <BaseNodeFooter
        onChangeColor={onChangeColor}
        onTag={onTag}
        onAttach={onAttach}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default TaskNode;
