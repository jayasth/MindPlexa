import React, { memo, FC, CSSProperties, useState } from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const edgeStyle: CSSProperties = {
  stroke: "#1a192b",
  strokeWidth: 2,
  cursor: "pointer",
};

const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [label, setLabel] = useState(data.label || "");

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
  };

  return (
    <>
      <path
        id={id}
        style={{ ...edgeStyle, ...style }}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={100}
        height={20}
        x={labelX - 50}
        y={labelY - 10}
        style={{ fontSize: "12px", textAlign: "center" }}
      >
        <input
          type="text"
          value={label}
          onChange={handleLabelChange}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            textAlign: "center",
          }}
        />
      </foreignObject>
    </>
  );
};

export default memo(CustomEdge);
