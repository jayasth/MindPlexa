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
  FaTextHeight,
  FaTint,
  FaFillDrip
} from 'react-icons/fa';
import styles from './DrawingToolbar.module.css';

interface DrawingToolbarProps {
  onToolSelect: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onStrokeColorChange: () => void;
  onFillColorChange: () => void;
  onStrokeWidthChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  strokeWidth: number;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  onToolSelect,
  onUndo,
  onRedo,
  onStrokeColorChange,
  onFillColorChange,
  onStrokeWidthChange,
  strokeWidth
}) => {
  return (
    <div className={styles.toolbar}>
      <button
        onClick={() => onToolSelect('pencil')}
        className={styles.toolbarButton}
        title="Pencil"
      >
        <FaPencilAlt />
      </button>
      <button
        onClick={() => onToolSelect('eraser')}
        className={styles.toolbarButton}
        title="Eraser"
      >
        <FaEraser />
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
      <button
        onClick={onFillColorChange}
        className={styles.toolbarButton}
        title="Fill Color"
      >
        <FaFillDrip />
      </button>
      <input
        type="number"
        min="1"
        max="100"
        value={strokeWidth}
        onChange={onStrokeWidthChange}
        className={styles.strokeWidthInput}
      />
    </div>
  );
};

export default DrawingToolbar;
