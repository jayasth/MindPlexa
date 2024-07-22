import React from 'react';
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
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      setToolSettings((prev) =>
        prev.map((tool, i) => (i === index ? { ...tool, color } : tool))
      );
    }
  };

  const handleStrokeWidthChange = (index: number, strokeWidth: number) => {
    if (strokeWidth > 0 && strokeWidth <= 100) {
      setToolSettings((prev) =>
        prev.map((tool, i) => (i === index ? { ...tool, strokeWidth } : tool))
      );
    }
  };

  return (
    <div className={styles.settingsContainer}>
      {toolSettings.map((tool, index) => (
        <div key={tool.name} className={styles.toolSetting}>
          <span className={styles.toolName}>{tool.name}</span>
          <input
            type="color"
            value={tool.color}
            onChange={(e) => handleColorChange(index, e.target.value)}
            className={styles.colorInput}
          />
          <input
            type="number"
            value={tool.strokeWidth}
            onChange={(e) =>
              handleStrokeWidthChange(index, parseInt(e.target.value, 10))
            }
            min={1}
            max={100}
            className={styles.widthInput}
          />
        </div>
      ))}
    </div>
  );
};

export default DrawNodeSettings;
