import React, { useState, useEffect } from 'react';
import { FaDownload, FaRuler } from 'react-icons/fa';
import { RiCheckboxBlankLine } from 'react-icons/ri';
import { GrPaint } from 'react-icons/gr';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import Modal from 'react-responsive-modal';
import { SketchPicker } from 'react-color';
import Slider from './DrawNodeSlider';
import styles from './DrawNodeTopbar.module.css';
import { saveDrawing } from '@/utils/canvas/drawNodeService';

interface Tool {
  name: string;
  icon: React.ComponentType<{ size: number }>;
}

interface ToolSetting {
  color: string;
  strokeWidth: number;
}

interface DrawNodeTopbarProps {
  download: () => void;
  clear: () => void;
  backgroundColor: string;
  textColor: string;
  tools: Tool[];
  toolSettings: ToolSetting[];
  onToolSettingChange: (
    toolIndex: number,
    key: keyof ToolSetting,
    value: ToolSetting[keyof ToolSetting]
  ) => void;
  currentToolIndex: number;
  currentColor: string;
  currentStrokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  nodeId: string;
}

const DrawNodeTopbar: React.FC<DrawNodeTopbarProps> = ({
  download,
  clear,
  backgroundColor,
  textColor,
  toolSettings,
  onToolSettingChange,
  currentToolIndex,
  currentColor,
  currentStrokeWidth,
  onColorChange,
  onStrokeWidthChange,
  nodeId
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isStrokeWidthOpen, setIsStrokeWidthOpen] = useState(false);
  const iconSize = 16;

  const currentToolSetting = toolSettings[currentToolIndex];

  useEffect(() => {
    onColorChange(currentToolSetting.color);
    onStrokeWidthChange(currentToolSetting.strokeWidth);
  }, [
    currentToolIndex,
    currentToolSetting,
    onColorChange,
    onStrokeWidthChange
  ]);

  const handleClear = async () => {
    clear();
    // After clearing, save an empty drawing
    await saveDrawing(
      nodeId,
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=='
    );
  };

  const handleColorChange = (color: { hex: string }) => {
    onColorChange(color.hex);
    onToolSettingChange(currentToolIndex, 'color', color.hex);
  };

  const handleStrokeWidthChange = (value: number) => {
    onStrokeWidthChange(value);
    onToolSettingChange(currentToolIndex, 'strokeWidth', value);
  };

  return (
    <div className={styles.topbar} style={{ backgroundColor }}>
      <div className={styles.toolGroup}>
        <Tooltip content="Clear">
          <button
            onClick={handleClear}
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
              style={{ backgroundColor: currentColor }}
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
              {currentStrokeWidth}
            </span>
          </button>
        </Tooltip>
      </div>
      <div className={styles.toolGroup}>
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

      <Modal
        open={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        center
      >
        <h2>Change Drawing Color</h2>
        <SketchPicker color={currentColor} onChange={handleColorChange} />
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
          value={currentStrokeWidth}
          onChange={handleStrokeWidthChange}
        />
      </Modal>
    </div>
  );
};

export default DrawNodeTopbar;
