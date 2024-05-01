import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { FaTimes } from 'react-icons/fa';
import styles from '@/ui/edges/EdgeStyles.module.css';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style
}) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const pathD = typeof edgePath === 'string' ? edgePath : edgePath.join(' ');

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
        x={(sourceX + targetX) / 2}
        y={(sourceY + targetY) / 2}
        style={{ cursor: 'pointer', userSelect: 'none', fill: 'red' }}
        onClick={() => console.log('Delete edge:', id)}
      >
        <FaTimes size="10" />
      </text>
    </>
  );
};

export default CustomEdge;
