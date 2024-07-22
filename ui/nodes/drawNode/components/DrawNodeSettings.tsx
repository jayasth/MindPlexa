import React from 'react';
import styles from './DrawNodeSettings.module.css';

interface ToolSetting {
  name: string;
  color: string;
  strokeWidth: number;
  opacity?: number;
  blendMode?: string;
}

interface DrawNodeSettingsProps {
  toolSettings: ToolSetting[];
  setToolSettings: React.Dispatch<React.SetStateAction<ToolSetting[]>>;
}

const DrawNodeSettings: React.FC<DrawNodeSettingsProps> = ({
  toolSettings,
  setToolSettings
}) => {
  const handleSettingChange = (
    index: number,
    key: keyof ToolSetting,
    value: any
  ) => {
    setToolSettings((prev) =>
      prev.map((tool, i) => (i === index ? { ...tool, [key]: value } : tool))
    );
  };

  const blendModes = [
    'normal',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten'
  ];

  return (
    <div className={styles.settingsContainer}>
      {toolSettings.map((tool, index) => (
        <div key={tool.name} className={styles.toolSetting}>
          <span className={styles.toolName}>{tool.name}</span>
          <input
            type="color"
            value={tool.color}
            onChange={(e) =>
              handleSettingChange(index, 'color', e.target.value)
            }
            className={styles.colorInput}
          />
          <input
            type="number"
            value={tool.strokeWidth}
            onChange={(e) =>
              handleSettingChange(
                index,
                'strokeWidth',
                parseInt(e.target.value, 10)
              )
            }
            min={1}
            max={100}
            className={styles.widthInput}
          />
          <input
            type="range"
            value={tool.opacity || 100}
            onChange={(e) =>
              handleSettingChange(
                index,
                'opacity',
                parseInt(e.target.value, 10)
              )
            }
            min={0}
            max={100}
            className={styles.opacityInput}
          />
          <select
            value={tool.blendMode || 'normal'}
            onChange={(e) =>
              handleSettingChange(index, 'blendMode', e.target.value)
            }
            className={styles.blendModeSelect}
          >
            {blendModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default DrawNodeSettings;
