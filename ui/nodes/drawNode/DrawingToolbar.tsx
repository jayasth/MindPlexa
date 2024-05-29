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
  FaMousePointer
} from 'react-icons/fa';
import styles from './DrawingToolbar.module.css';
import MarkerOptions from '@/ui/nodes/drawNode/DrawToolOptions';

interface DrawingToolbarProps {
  onToolSelect: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  currentTool: string;
  currentStroke: string;
  setCurrentStroke: (color: string) => void;
  currentStrokeWidth: number;
  setCurrentStrokeWidth: (width: number) => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  onToolSelect,
  onUndo,
  onRedo,
  currentTool,
  currentStroke,
  setCurrentStroke,
  currentStrokeWidth,
  setCurrentStrokeWidth
}) => {
  return (
    <div className={`${styles.toolbar} nodrag`}>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "select" tool');
          onToolSelect('select');
        }}
        className={styles.toolbarButton}
        title="Select"
      >
        <FaMousePointer />
      </button>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "marker" tool');
          onToolSelect('marker');
        }}
        className={styles.toolbarButton}
        title="Marker"
      >
        <FaHighlighter />
      </button>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "eraser" tool');
          onToolSelect('eraser');
        }}
        className={styles.toolbarButton}
        title="Eraser"
      >
        <FaEraser />
      </button>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "rectangle" tool');
          onToolSelect('rectangle');
        }}
        className={styles.toolbarButton}
        title="Rectangle"
      >
        <FaSquare />
      </button>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "circle" tool');
          onToolSelect('circle');
        }}
        className={styles.toolbarButton}
        title="Circle"
      >
        <FaCircle />
      </button>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "line" tool');
          onToolSelect('line');
        }}
        className={styles.toolbarButton}
        title="Line"
      >
        <FaSlash />
      </button>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "arrow" tool');
          onToolSelect('arrow');
        }}
        className={styles.toolbarButton}
        title="Arrow"
      >
        <FaArrowRight />
      </button>
      <button
        onClick={() => {
          console.log('DrawingToolbar: Selecting "text" tool');
          onToolSelect('text');
        }}
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
      {currentTool === 'marker' && (
        <MarkerOptions
          currentStroke={currentStroke}
          setCurrentStroke={setCurrentStroke}
          currentStrokeWidth={currentStrokeWidth}
          setCurrentStrokeWidth={setCurrentStrokeWidth}
        />
      )}
    </div>
  );
};

export default DrawingToolbar;
