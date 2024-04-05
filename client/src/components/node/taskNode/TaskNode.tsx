import React from "react";
import { Handle, Position } from "reactflow";
import { FaTasks } from "react-icons/fa";

interface TaskNodeProps {
  data: {
    label: string;
    description: string;
  };
}

const TaskNode: React.FC<TaskNodeProps> = ({ data }) => {
  return (
    <div className="task-node">
      <div className="task-node-header">
        <FaTasks className="task-icon" />
        <span>{data.label}</span>
      </div>
      <div className="task-node-content">{data.description}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default TaskNode;
