import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow
} from 'reactflow';
import styles from '@/ui/edges/CustomEdgeStyles.module.css';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  onDelete // Add this prop
}: EdgeProps & { onDelete?: (id: string) => void }) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const onEdgeClick = () => {
    console.log('onEdgeClick called with id:', id);
    onDelete?.(id);
    setEdges((edges) => {
      console.log('edges before:', edges); // Log the edges state before it's updated
      const newEdges = edges.filter((edge) => edge.id !== id);
      console.log('edges after:', newEdges); // Log the edges state after it's updated
      return newEdges;
    });
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all'
          }}
          className={`${styles.nodrag} ${styles.nopan}`}
        >
          <button className={styles.edgebutton} onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
