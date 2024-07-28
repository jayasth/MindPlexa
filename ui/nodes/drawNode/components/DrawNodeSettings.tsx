import React from 'react';
import styles from './DrawNodeSettings.module.css';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';

interface DrawNodeSettingsProps {
  tools: any[];
  toolSettings: any[];
  onToolSettingChange: (toolIndex: number, key: string, value: any) => void;
}

const DrawNodeSettings: React.FC<DrawNodeSettingsProps> = ({
  tools,
  toolSettings,
  onToolSettingChange
}) => {
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
      <h3>Tool Settings</h3>
      <div className={styles.header}>
        <span>Tool</span>
        <span>Color</span>
        <span>Width</span>
        <span>Opacity</span>
        <span>Blend</span>
      </div>
      {tools.map((tool, index) => (
        <div key={tool.tool.name} className={styles.toolSetting}>
          <span className={styles.toolName}>{tool.tool.name}</span>
          <Input
            type="color"
            value={toolSettings[index].color}
            onChange={(value) => onToolSettingChange(index, 'color', value)}
            className={styles.colorInput}
            variant="slim"
            disabled={tool.tool.name === 'Eraser'}
          />
          <Input
            type="number"
            value={toolSettings[index].strokeWidth.toString()}
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
            value={toolSettings[index].opacity.toString()}
            onChange={(value) =>
              onToolSettingChange(index, 'opacity', parseInt(value, 10))
            }
            min={0}
            max={100}
            className={styles.opacityInput}
            variant="slim"
          />
          <Dropdown
            value={toolSettings[index].blendMode}
            onChange={(value) => onToolSettingChange(index, 'blendMode', value)}
            className={styles.blendModeSelect}
            variant="slim"
            disabled={tool.tool.name === 'Eraser'}
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
