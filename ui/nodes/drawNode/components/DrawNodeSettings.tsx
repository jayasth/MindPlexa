import React from 'react';
import { SketchPicker } from 'react-color';
import Slider from './DrawNodeSlider';
import styles from './DrawNodeSettings.module.css';

interface ToolSetting {
  name: string;
  color: string;
  strokeWidth: number;
}

interface DrawNodeSettingsProps {
  toolSettings: ToolSetting[];
  setToolSettings: React.Dispatch<React.SetStateAction<ToolSetting[]>>;
}

const DrawNodeSettings: React.FC<DrawNodeSettingsProps> = ({
  toolSettings,
  setToolSettings
}) => {
  const handleColorChange = (index: number, color: string) => {
    setToolSettings((prev) =>
      prev.map((tool, i) => (i === index ? { ...tool, color } : tool))
    );
  };

  const handleStrokeWidthChange = (index: number, strokeWidth: number) => {
    setToolSettings((prev) =>
      prev.map((tool, i) => (i === index ? { ...tool, strokeWidth } : tool))
    );
  };

  return (
    <div className={styles.settingsContainer}>
      {toolSettings.map((tool, index) => (
        <div key={tool.name} className={styles.toolSetting}>
          <h4>{tool.name}</h4>
          <div className={styles.settingRow}>
            <span>Color:</span>
            <div className={styles.colorPickerWrapper}>
              <SketchPicker
                color={tool.color}
                onChange={(color) => handleColorChange(index, color.hex)}
              />
            </div>
          </div>
          <div className={styles.settingRow}>
            <span>Stroke Width:</span>
            <Slider
              min={1}
              max={100}
              value={tool.strokeWidth}
              onChange={(value) => handleStrokeWidthChange(index, value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrawNodeSettings;
