import React from 'react';
import {
  FaUndo,
  FaRedo,
  FaDownload,
  FaSearchPlus,
  FaSearchMinus,
  FaEraser
} from 'react-icons/fa';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import styles from './DrawNodeTopbar.module.css';

interface DrawNodeTopbarProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  download: () => void;
  clear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  backgroundColor: string;
  textColor: string;
}

const DrawNodeTopbar: React.FC<DrawNodeTopbarProps> = ({
  undo,
  redo,
  canUndo,
  canRedo,
  download,
  clear,
  onZoomIn,
  onZoomOut,
  backgroundColor,
  textColor
}) => {
  const iconSize = 16;

  return (
    <div className={styles.topbar} style={{ backgroundColor }}>
      <div className={styles.toolGroup}>
        <Tooltip content="Undo">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaUndo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Redo">
          <button
            onClick={redo}
            disabled={!canRedo}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaRedo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Clear">
          <button
            onClick={clear}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaEraser size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Download">
          <button
            onClick={download}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaDownload size={iconSize} />
          </button>
        </Tooltip>
      </div>
      <div className={styles.toolGroup}>
        <Tooltip content="Zoom In">
          <button
            onClick={onZoomIn}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaSearchPlus size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Zoom Out">
          <button
            onClick={onZoomOut}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaSearchMinus size={iconSize} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default DrawNodeTopbar;
