import React from 'react';
import {
  FaUndo,
  FaRedo,
  FaDownload,
  FaSearchPlus,
  FaSearchMinus,
  FaRuler
} from 'react-icons/fa';
import { RiCheckboxBlankLine } from 'react-icons/ri';
import { GrPaint } from 'react-icons/gr';
import { HexColorPicker } from 'react-colorful';
import { Popover } from '@/ui/Popover/Popover';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import Slider from './DrawNodeSlider';
import styles from './DrawNodeToolbar.module.css';

interface DrawNodeToolbarProps {
  tools: Array<[any, any, number]>;
  currentTool: number;
  setCurrentTool: (index: number) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  download: () => void;
  clear: () => void;
  backgroundColor: string;
  textColor: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const DrawNodeToolbar: React.FC<DrawNodeToolbarProps> = ({
  tools,
  currentTool,
  setCurrentTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  undo,
  redo,
  canUndo,
  canRedo,
  download,
  clear,
  backgroundColor,
  textColor,
  onZoomIn,
  onZoomOut
}) => {
  const iconSize = 16;

  return (
    <div className={styles.toolbar} style={{ backgroundColor }}>
      <div className={styles.toolGroup}>
        {tools.map(([tool, Icon], index) => (
          <Tooltip key={tool.name} content={tool.name}>
            <button
              className={`${styles.toolbarButton} ${currentTool === index ? styles.selected : ''}`}
              onClick={() => setCurrentTool(index)}
              style={{ color: textColor }}
            >
              <Icon size={iconSize} />
            </button>
          </Tooltip>
        ))}
      </div>
      <div className={styles.toolGroup}>
        <Popover
          trigger={
            <button
              className={`${styles.toolbarButton} ${styles.colorPickerButton}`}
            >
              <GrPaint size={iconSize} color={color} />
            </button>
          }
          content={<HexColorPicker color={color} onChange={setColor} />}
        />
        <Popover
          trigger={
            <button
              className={`${styles.toolbarButton} ${styles.sizePickerButton}`}
            >
              <FaRuler size={iconSize} color={textColor} />
              <span className={styles.strokeWidthLabel}>{strokeWidth}</span>
            </button>
          }
          content={
            <Slider
              min={1}
              max={100}
              value={strokeWidth}
              onChange={setStrokeWidth}
            />
          }
        />
      </div>
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
            <RiCheckboxBlankLine size={iconSize} />
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

export default DrawNodeToolbar;
