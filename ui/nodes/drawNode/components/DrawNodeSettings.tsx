import React from 'react';
import Input from '@/ui/Input/Input';
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

  const handleStrokeWidthChange = (index: number, strokeWidth: string) => {
    const width = parseInt(strokeWidth, 10);
    if (!isNaN(width) && width > 0 && width <= 100) {
      setToolSettings((prev) =>
        prev.map((tool, i) =>
          i === index ? { ...tool, strokeWidth: width } : tool
        )
      );
    }
  };

  return (
    <div className={styles.settingsContainer}>
      {toolSettings.map((tool, index) => (
        <div key={tool.name} className={styles.toolSetting}>
          <h4>{tool.name}</h4>
          <div className={styles.settingRow}>
            <Input
              type="text"
              placeholder="Color (hex)"
              value={tool.color}
              onChange={(value) => handleColorChange(index, value)}
              variant="slim"
            />
          </div>
          <div className={styles.settingRow}>
            <Input
              type="number"
              placeholder="Stroke Width"
              value={tool.strokeWidth.toString()}
              onChange={(value) => handleStrokeWidthChange(index, value)}
              variant="slim"
              min={1}
              max={100}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrawNodeSettings;
