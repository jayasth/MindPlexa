// ui/nodes/NoteNode.tsx
import React from 'react';
import styles from './NoteNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface NoteNodeProps {
  content: string;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
  color: string;
  width: number;
  height: number;
}

const NoteNode: React.FC<NoteNodeProps> = ({
  content,
  onDelete,
  onChangeColor,
  onResize,
  color,
  width,
  height
}) => {
  const handleColorChange = () => {
    const newColor = prompt('Enter a new color:');
    if (newColor) {
      onChangeColor(newColor);
    }
  };

  const handleResize = () => {
    const newWidth = prompt('Enter a new width:');
    const newHeight = prompt('Enter a new height:');
    if (newWidth && newHeight) {
      onResize(parseInt(newWidth), parseInt(newHeight));
    }
  };

  return (
    <div className={styles.noteNode}>
      <div className={styles.noteHeader}>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Node"
        >
          <FaTrash size="10" />
        </button>
        <button
          onClick={handleColorChange}
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size="10" />
        </button>
        <button
          onClick={handleResize}
          className={styles.resizeButton}
          title="Resize Node"
        >
          <FaExpand size="10" />
        </button>
      </div>
      <textarea
        className={styles.noteContent}
        value={content}
        readOnly
        style={{ backgroundColor: color, width, height }}
      />
    </div>
  );
};

export default NoteNode;
