import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { FaTimes } from 'react-icons/fa';
import styles from '@/ui/edges/EdgeStyles.module.css';

import { Position } from 'reactflow';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style: React.CSSProperties;
  onDelete: (id: string) => void;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  onDelete
}) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const pathD = Array.isArray(edgePath) ? edgePath[0] : edgePath;

  console.log('edgePath:', edgePath);
  console.log('pathD:', pathD);

  return (
    <>
      <path
        id={id}
        style={{ ...style, stroke: 'currentColor', strokeWidth: 2 }}
        className={`${styles.reactFlowEdgePath} react-flow__edge-path`}
        d={pathD}
        markerEnd="url(#markerArrow)"
      />
      <text
        x={(sourceX + targetX) / 2 - 10} // Adjust the x and y attributes
        y={(sourceY + targetY) / 2 - 10}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          fill: 'red',
          zIndex: 1000
        }}
        onClick={() => onDelete(id)}
      >
        <FaTimes size="10" />
      </text>
    </>
  );
};

export default CustomEdge;
