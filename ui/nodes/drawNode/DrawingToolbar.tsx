import React from 'react';
import { FaPencilAlt, FaEraser, FaUndo, FaRedo } from 'react-icons/fa';
import styles from './DrawingToolbar.module.css';

interface DrawingToolbarProps {
  onPencilClick: () => void;
  onEraserClick: () => void;
  onUndoClick: () => void;
  onRedoClick: () => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  onPencilClick,
  onEraserClick,
  onUndoClick,
  onRedoClick
}) => {
  return (
    <div className={styles.toolbar}>
      <button onClick={onPencilClick} className={styles.toolbarButton}>
        <FaPencilAlt />
      </button>
      <button onClick={onEraserClick} className={styles.toolbarButton}>
        <FaEraser />
      </button>
      <button onClick={onUndoClick} className={styles.toolbarButton}>
        <FaUndo />
      </button>
      <button onClick={onRedoClick} className={styles.toolbarButton}>
        <FaRedo />
      </button>
    </div>
  );
};

export default DrawingToolbar;
