import React, { useState } from 'react';
import {
  FaUndo,
  FaRedo,
  FaDownload,
  FaSearchPlus,
  FaSearchMinus,
  FaRuler,
  FaLayerGroup,
  FaCog
} from 'react-icons/fa';
import { RiCheckboxBlankLine } from 'react-icons/ri';
import { GrPaint } from 'react-icons/gr';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import Modal from 'react-responsive-modal';
import { SketchPicker } from 'react-color';
import Slider from './DrawNodeSlider';
import LayerPanel from './LayerPanel';
import { Layer } from '../types';
import styles from './DrawNodeTopbar.module.css';
import DrawNodeSettings from './DrawNodeSettings';
import { ArtboardRef } from '@/ui/nodes/drawNode/DrawNodeTools';

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
  currentTool: any;
  currentToolSetting: any;
  onToolSettingChange: (key: string, value: any) => void;
  toggleLayerPanel: () => void;
  showLayerPanel: boolean;
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
  textColor,
  currentTool,
  currentToolSetting,
  onToolSettingChange,
  toggleLayerPanel,
  showLayerPanel
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isStrokeWidthOpen, setIsStrokeWidthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const iconSize = 16;

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  const handleClear = () => {
    clear();
  };

  const handleColorChange = (color: { hex: string }) => {
    onToolSettingChange('color', color.hex);
  };

  const handleStrokeWidthChange = (value: number) => {
    onToolSettingChange('strokeWidth', value);
  };

  return (
    <div className={styles.topbar} style={{ backgroundColor }}>
      <div className={styles.toolGroup}>
        <Tooltip content="Undo">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaUndo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Redo">
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaRedo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Clear">
          <button
            onClick={handleClear}
            disabled={!canUndo}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <RiCheckboxBlankLine size={iconSize} />
          </button>
        </Tooltip>
      </div>
      <div className={styles.toolGroup}>
        <Tooltip content="Change Color">
          <button
            className={`${styles.toolbarButton} ${styles.colorPickerButton}`}
            onClick={() => setIsColorPickerOpen(true)}
            style={{ color: textColor }}
          >
            <GrPaint size={iconSize} />
            <div
              className={styles.colorPreview}
              style={{ backgroundColor: currentToolSetting.color }}
            />
          </button>
        </Tooltip>
        <Tooltip content="Change Stroke Width">
          <button
            className={`${styles.toolbarButton} ${styles.sizePickerButton}`}
            onClick={() => setIsStrokeWidthOpen(true)}
            style={{ color: textColor }}
          >
            <FaRuler size={iconSize} />
            <span className={styles.strokeWidthLabel}>
              {currentToolSetting.strokeWidth}
            </span>
          </button>
        </Tooltip>
        <Tooltip content="Toggle Layers">
          <button
            className={`${styles.toolbarButton} ${showLayerPanel ? styles.active : ''}`}
            onClick={toggleLayerPanel}
            style={{ color: textColor }}
          >
            <FaLayerGroup size={iconSize} />
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
        <Tooltip content="Download">
          <button
            onClick={download}
            className={styles.toolbarButton}
            style={{ color: textColor }}
          >
            <FaDownload size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Settings">
          <button
            className={`${styles.toolbarButton}`}
            onClick={() => setIsSettingsOpen(true)}
            style={{ color: textColor }}
          >
            <FaCog size={iconSize} />
          </button>
        </Tooltip>
      </div>

      <Modal
        open={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        center
      >
        <h2>Change Drawing Color</h2>
        <SketchPicker
          color={currentToolSetting.color}
          onChange={handleColorChange}
        />
      </Modal>

      <Modal
        open={isStrokeWidthOpen}
        onClose={() => setIsStrokeWidthOpen(false)}
        center
      >
        <h2>Change Stroke Width</h2>
        <Slider
          min={1}
          max={100}
          value={currentToolSetting.strokeWidth}
          onChange={handleStrokeWidthChange}
        />
      </Modal>

      <Modal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        center
      >
        <h2>Tool Settings</h2>
        <DrawNodeSettings
          currentTool={currentTool}
          currentToolSetting={currentToolSetting}
          onToolSettingChange={onToolSettingChange}
        />
      </Modal>
    </div>
  );
};

export default DrawNodeTopbar;
