import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position, NodeResizer, OnResize } from 'reactflow';
import BaseNodeHeader from '@/ui/nodes/BaseNodeHeader';
import BaseNodeFooter from '@/ui/nodes/BaseNodeFooter';
import taskStyles from './TaskNode.module.css';
import baseStyles from '@/ui/nodes/BaseNode.module.css';
import styles from '@/ui/edges/EdgeStyles.module.css';

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
  onNodeResizeStop: (newSize: { width: number; height: number }) => void;
}

const TaskNode: React.FC<TaskNodeProps> = ({
  data,
  id,
  selected,
  onDelete,
  onChangeColor,
  onTag,
  onAttach,
  onToggleComplete,
  onNodeResizeStop
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

  const handleResizeStop: OnResize = (event, node) => {
    const newSize = {
      width: node.width,
      height: node.height
    };
    setSize(newSize);
    onNodeResizeStop(newSize);
  };

  return (
    <div
      className={`${baseStyles.baseNode} ${taskStyles.taskNode}`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={150}
        isVisible={selected}
        onResize={handleResizeStop}
        lineStyle={{ stroke: '#ff0071', strokeWidth: 2 }}
        handleStyle={{ fill: '#ff0071' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className={`${styles.reactFlowHandle} ${styles.reactFlowHandleTop}`}
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
        className={`${styles.reactFlowHandle} ${styles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default TaskNode;
