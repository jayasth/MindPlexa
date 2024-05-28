import React, { useState, useRef, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { FaTint } from 'react-icons/fa';
import Draggable from 'react-draggable';
import styles from '@/ui/nodes/drawNode/DrawToolOptions.module.css';

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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target)
    ) {
      setShowColorPicker(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  return (
    <Draggable bounds="parent">
      <div className={`${styles.markerOptions} nodrag`}>
        <div className={styles.iconContainer}>
          <span>Stroke Color</span>
          <FaTint
            title="Stroke Color"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={styles.icon}
          />
          {showColorPicker && (
            <div className={styles.colorPicker} ref={colorPickerRef}>
              <SketchPicker
                color={currentStroke}
                onChange={(color) => setCurrentStroke(color.hex)}
              />
            </div>
          )}
        </div>
        <div className={styles.strokeWidthContainer}>
          <span>Stroke Width</span>
          <input
            type="number"
            min="1"
            max="20"
            value={currentStrokeWidth}
            onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
            className={styles.strokeWidthInput}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default MarkerOptions;
