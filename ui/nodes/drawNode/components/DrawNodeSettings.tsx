import React from 'react';
import styles from './DrawNodeSettings.module.css';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';

interface DrawNodeSettingsProps {
  currentTool: any;
  currentToolSetting: any;
  onToolSettingChange: (key: string, value: any) => void;
}

const DrawNodeSettings: React.FC<DrawNodeSettingsProps> = ({
  currentTool,
  currentToolSetting,
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
      <h3>{currentTool.tool.name} Settings</h3>
      <div className={styles.setting}>
        <label>Color:</label>
        <Input
          type="color"
          value={currentToolSetting.color}
          onChange={(value) => onToolSettingChange('color', value)}
          className={styles.colorInput}
          variant="slim"
          disabled={currentTool.tool.name === 'Eraser'}
        />
      </div>
      <div className={styles.setting}>
        <label>Stroke Width:</label>
        <Input
          type="number"
          value={currentToolSetting.strokeWidth.toString()}
          onChange={(value) =>
            onToolSettingChange('strokeWidth', parseInt(value, 10))
          }
          min={1}
          max={100}
          className={styles.widthInput}
          variant="slim"
        />
      </div>
      <div className={styles.setting}>
        <label>Opacity:</label>
        <Input
          type="range"
          value={currentToolSetting.opacity.toString()}
          onChange={(value) =>
            onToolSettingChange('opacity', parseInt(value, 10))
          }
          min={0}
          max={100}
          className={styles.opacityInput}
          variant="slim"
        />
      </div>
      <div className={styles.setting}>
        <label>Blend Mode:</label>
        <Dropdown
          value={currentToolSetting.blendMode}
          onChange={(value) => onToolSettingChange('blendMode', value)}
          className={styles.blendModeSelect}
          variant="slim"
          disabled={currentTool.tool.name === 'Eraser'}
        >
          {blendModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </Dropdown>
      </div>
    </div>
  );
};

export default DrawNodeSettings;
