import React from 'react';
import { FaUndo, FaRedo, FaDownload, FaTrash } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import { Popover } from '@/ui/Popover/Popover';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import Slider from './DrawNodeSlider';
import toolbarStyles from '@/ui/nodes/drawNode/components/DrawNodeToolbar.module.css';

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
  clear
}) => {
  const iconSize = 12;

  return (
    <div className={toolbarStyles.toolbar}>
      <div className={toolbarStyles.toolGroup}>
        {tools.map(([tool, Icon], index) => (
          <Tooltip key={tool.name} content={tool.name}>
            <button
              className={`${toolbarStyles.toolbarButton} ${currentTool === index ? toolbarStyles.selected : ''}`}
              onClick={() => setCurrentTool(index)}
            >
              <Icon size={iconSize} />
            </button>
          </Tooltip>
        ))}
      </div>
      <div className={toolbarStyles.toolGroup}>
        <Popover
          trigger={
            <button
              className={toolbarStyles.toolbarButton}
              style={{ backgroundColor: color }}
            >
              <span className={toolbarStyles.colorIndicator} />
            </button>
          }
          content={<HexColorPicker color={color} onChange={setColor} />}
        />
        <Popover
          trigger={
            <button className={toolbarStyles.toolbarButton}>
              <span
                className={toolbarStyles.sizeIndicator}
                style={{ width: strokeWidth, height: strokeWidth }}
              />
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
        <Tooltip content="Undo">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={toolbarStyles.toolbarButton}
          >
            <FaUndo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Redo">
          <button
            onClick={redo}
            disabled={!canRedo}
            className={toolbarStyles.toolbarButton}
          >
            <FaRedo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Download">
          <button onClick={download} className={toolbarStyles.toolbarButton}>
            <FaDownload size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Clear">
          <button onClick={clear} className={toolbarStyles.toolbarButton}>
            <FaTrash size={iconSize} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default DrawNodeToolbar;
