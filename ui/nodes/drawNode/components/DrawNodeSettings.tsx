import React from 'react';
import styles from './DrawNodeSettings.module.css';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';

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
      <div className={styles.header}>
        <span>Tool</span>
        <span>Color</span>
        <span>Width</span>
        <span>Opacity</span>
        <span>Blend</span>
      </div>
      {toolSettings.map((tool, index) => (
        <div key={tool.name} className={styles.toolSetting}>
          <span className={styles.toolName}>{tool.name}</span>
          <Input
            type="color"
            value={tool.color}
            onChange={(value) => handleSettingChange(index, 'color', value)}
            className={styles.colorInput}
            variant="slim"
          />
          <Input
            type="number"
            value={tool.strokeWidth.toString()}
            onChange={(value) =>
              handleSettingChange(index, 'strokeWidth', parseInt(value, 10))
            }
            min={1}
            max={100}
            className={styles.widthInput}
            variant="slim"
          />
          <Input
            type="range"
            value={(tool.opacity || 100).toString()}
            onChange={(value) =>
              handleSettingChange(index, 'opacity', parseInt(value, 10))
            }
            min={0}
            max={100}
            className={styles.opacityInput}
            variant="slim"
          />
          <Dropdown
            value={tool.blendMode || 'normal'}
            onChange={(value) => handleSettingChange(index, 'blendMode', value)}
            className={styles.blendModeSelect}
            variant="slim"
          >
            {blendModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </Dropdown>
        </div>
      ))}
    </div>
  );
};

export default DrawNodeSettings;
