import React from "react";
import { Handle, Position } from "reactflow";
import { FaCircle } from "react-icons/fa";
import Expander from "../../ai/expander/Expander";

interface BasicNodeProps {
  data: {
    id: string;
    label: string;
    description: string;
    content: string;
  };
}

const BasicNode: React.FC<BasicNodeProps> = ({ data }) => {
  const handleExpandNode = (nodeId: string, expandedContent: string) => {
    console.log(`Expanded content for node ${nodeId}:`, expandedContent);
    // Add logic to update the node content in the project state
  };

  return (
    <div className="basic-node">
      <div className="basic-node-header">
        <FaCircle className="basic-icon" />
        <span>{data.label}</span>
      </div>
      <div className="basic-node-content">{data.description}</div>
      <Expander
        nodeId={data.id}
        nodeContent={data.content}
        onExpandNode={handleExpandNode}
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BasicNode;
