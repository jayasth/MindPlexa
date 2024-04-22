import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from './NoteNode.module.css';
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

interface NoteNodeData extends BaseNodeData {
  content?: string | null;
  title?: string | null;
}

interface NoteNodeProps {
  data: NoteNodeData;
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

const NoteNode: React.FC<NoteNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div className={styles.noteNode}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
      <div
        style={{
          backgroundColor: data.color || 'transparent',
          width: data.width ? `${data.width}px` : 'auto',
          height: data.height ? `${data.height}px` : 'auto'
        }}
      >
        <div className={styles.noteHeader}>
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
        <textarea
          className={styles.noteContent}
          value={data.content || ''}
          readOnly
        />
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

export default NoteNode;
