import React from 'react';
import {
  FaPencilAlt,
  FaEraser,
  FaUndo,
  FaRedo,
  FaHighlighter,
  FaSquare,
  FaCircle,
  FaSlash,
  FaArrowRight,
  FaTextHeight
} from 'react-icons/fa';
import styles from './DrawingToolbar.module.css';

interface DrawingToolbarProps {
  onPencilClick: () => void;
  onEraserClick: () => void;
  onUndoClick: () => void;
  onRedoClick: () => void;
  onMarkerClick: () => void;
  onShapeClick: (shape: string) => void;
  onLineClick: () => void;
  onArrowClick: () => void;
  onTextClick: () => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  onPencilClick,
  onEraserClick,
  onUndoClick,
  onRedoClick,
  onMarkerClick,
  onShapeClick,
  onLineClick,
  onArrowClick,
  onTextClick
}) => {
  return (
    <div className={styles.toolbar}>
      <button
        onClick={onPencilClick}
        className={styles.toolbarButton}
        title="Pencil"
      >
        <FaPencilAlt />
      </button>
      <button
        onClick={onEraserClick}
        className={styles.toolbarButton}
        title="Eraser"
      >
        <FaEraser />
      </button>
      <button
        onClick={onMarkerClick}
        className={styles.toolbarButton}
        title="Marker"
      >
        <FaHighlighter />
      </button>
      <button
        onClick={() => onShapeClick('rectangle')}
        className={styles.toolbarButton}
        title="Rectangle"
      >
        <FaSquare />
      </button>
      <button
        onClick={() => onShapeClick('circle')}
        className={styles.toolbarButton}
        title="Circle"
      >
        <FaCircle />
      </button>
      <button
        onClick={onLineClick}
        className={styles.toolbarButton}
        title="Line"
      >
        <FaSlash />
      </button>
      <button
        onClick={onArrowClick}
        className={styles.toolbarButton}
        title="Arrow"
      >
        <FaArrowRight />
      </button>
      <button
        onClick={onTextClick}
        className={styles.toolbarButton}
        title="Text"
      >
        <FaTextHeight />
      </button>
      <button
        onClick={onUndoClick}
        className={styles.toolbarButton}
        title="Undo"
      >
        <FaUndo />
      </button>
      <button
        onClick={onRedoClick}
        className={styles.toolbarButton}
        title="Redo"
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default DrawingToolbar;
