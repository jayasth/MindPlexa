import React from 'react';
import styles from './DrawNodeSettings.module.css';
import Input from '@/ui/Input/Input';

interface Tool {
  tool: {
    name: string;
  };
}

interface ToolSetting {
  color: string;
  strokeWidth: number;
  opacity: number;
}

interface DrawNodeSettingsProps {
  tools: Tool[];
  toolSettings: ToolSetting[];
  onToolSettingChange: (
    toolIndex: number,
    key: keyof ToolSetting,
    value: string | number
  ) => void;
}

const DrawNodeSettings: React.FC<DrawNodeSettingsProps> = ({
  tools,
  toolSettings,
  onToolSettingChange
}) => {
  return (
    <div className={styles.settingsContainer}>
      <h3>Tool Settings</h3>
      <div className={styles.header}>
        <span>Tool</span>
        <span>Color</span>
        <span>Width</span>
        <span>Opacity</span>
      </div>
      {tools.map((tool, index) => {
        const setting = toolSettings[index];
        return (
          <div key={tool.tool.name} className={styles.toolSetting}>
            <span className={styles.toolName}>{tool.tool.name}</span>
            <Input
              type="color"
              value={setting.color}
              onChange={(value) => onToolSettingChange(index, 'color', value)}
              className={styles.colorInput}
              variant="slim"
              disabled={tool.tool.name === 'Eraser'}
            />
            <Input
              type="number"
              value={setting.strokeWidth.toString()}
              onChange={(value) =>
                onToolSettingChange(index, 'strokeWidth', parseInt(value, 10))
              }
              min={1}
              max={100}
              className={styles.widthInput}
              variant="slim"
            />
            <Input
              type="number"
              value={setting.opacity.toString()}
              onChange={(value) =>
                onToolSettingChange(index, 'opacity', parseInt(value, 10))
              }
              min={0}
              max={100}
              className={styles.opacityInput}
              variant="slim"
            />
          </div>
        );
      })}
    </div>
  );
};

export default DrawNodeSettings;
