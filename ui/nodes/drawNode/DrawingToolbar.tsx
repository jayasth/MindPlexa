import React from 'react';
import {
  FaEraser,
  FaUndo,
  FaRedo,
  FaHighlighter,
  FaSquare,
  FaCircle,
  FaSlash,
  FaArrowRight,
  FaTextHeight,
  FaTint,
  FaMousePointer
} from 'react-icons/fa';
import styles from './DrawingToolbar.module.css';

interface DrawingToolbarProps {
  onToolSelect: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onStrokeColorChange: () => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  onToolSelect,
  onUndo,
  onRedo,
  onStrokeColorChange
}) => {
  return (
    <div className={styles.toolbar}>
      <button
        onClick={() => onToolSelect('select')}
        className={styles.toolbarButton}
        title="Select"
      >
        <FaMousePointer />
      </button>
      <button
        onClick={() => onToolSelect('marker')}
        className={styles.toolbarButton}
        title="Marker"
      >
        <FaHighlighter />
      </button>
      <button
        onClick={() => onToolSelect('rectangle')}
        className={styles.toolbarButton}
        title="Rectangle"
      >
        <FaSquare />
      </button>
      <button
        onClick={() => onToolSelect('circle')}
        className={styles.toolbarButton}
        title="Circle"
      >
        <FaCircle />
      </button>
      <button
        onClick={() => onToolSelect('line')}
        className={styles.toolbarButton}
        title="Line"
      >
        <FaSlash />
      </button>
      <button
        onClick={() => onToolSelect('arrow')}
        className={styles.toolbarButton}
        title="Arrow"
      >
        <FaArrowRight />
      </button>
      <button
        onClick={() => onToolSelect('text')}
        className={styles.toolbarButton}
        title="Text"
      >
        <FaTextHeight />
      </button>
      <button onClick={onUndo} className={styles.toolbarButton} title="Undo">
        <FaUndo />
      </button>
      <button onClick={onRedo} className={styles.toolbarButton} title="Redo">
        <FaRedo />
      </button>
      <button
        onClick={onStrokeColorChange}
        className={styles.toolbarButton}
        title="Stroke Color"
      >
        <FaTint />
      </button>
    </div>
  );
};

export default DrawingToolbar;
