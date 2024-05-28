import React from 'react';
import { SketchPicker } from 'react-color';
import styles from './MarkerOptions.module.css';

interface MarkerOptionsProps {
  currentStroke: string;
  setCurrentStroke: (color: string) => void;
  currentStrokeWidth: number;
  setCurrentStrokeWidth: (width: number) => void;
}

const MarkerOptions: React.FC<MarkerOptionsProps> = ({
  currentStroke,
  setCurrentStroke,
  currentStrokeWidth,
  setCurrentStrokeWidth
}) => {
  return (
    <div className={styles.markerOptions}>
      <div className={styles.colorPicker}>
        <SketchPicker
          color={currentStroke}
          onChange={(color) => setCurrentStroke(color.hex)}
        />
      </div>
      <div className={styles.strokeWidthSlider}>
        <input
          type="range"
          min="1"
          max="20"
          value={currentStrokeWidth}
          onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default MarkerOptions;
