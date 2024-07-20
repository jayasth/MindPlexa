import React from 'react';
import styles from './DrawNodeSlider.module.css';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ min, max, value, onChange }) => {
  return (
    <div className={styles.sliderContainer}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.slider}
      />
      <span className={styles.sliderValue}>{value}</span>
    </div>
  );
};

export default Slider;
