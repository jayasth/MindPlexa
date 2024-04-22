import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './DrawNode.module.css';
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

interface DrawNodeData extends BaseNodeData {
  // Assuming 'data' field from the database is used to store specific drawing data
  data?: any; // Replace 'any' with the correct type if available
  title?: string | null;
}

interface DrawNodeProps extends NodeProps {
  data: DrawNodeData;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
  id: string;
  selected: boolean;
  type: string;
  zIndex: number;
  isConnectable: boolean;
  xPos: number;
  yPos: number;
  dragging: boolean;
}

const DrawNode: React.FC<DrawNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.drawNode}
      style={{
        backgroundColor: data.color || 'transparent',
        width: data.width ? `${data.width}px` : 'auto',
        height: data.height ? `${data.height}px` : 'auto'
      }}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
      <div className={styles.drawHeader}>
        <span className={styles.drawTitle}>
          {data.title || 'Untitled Drawing'}
        </span>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Node"
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
          title="Resize Node"
        >
          <FaExpand size={10} />
        </button>
      </div>
      <div className={styles.drawContent}>
        {/* Drawing content would be rendered here */}
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

export default DrawNode;
