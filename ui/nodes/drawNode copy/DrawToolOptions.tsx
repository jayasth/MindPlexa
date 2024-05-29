import React, { useState, useRef, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { FaTint } from 'react-icons/fa';
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
  const markerRef = useRef<HTMLDivElement>(null);

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

  const handleMouseDown = (event) => {
    const marker = markerRef.current;
    if (marker) {
      const shiftX = event.clientX - marker.getBoundingClientRect().left;
      const shiftY = event.clientY - marker.getBoundingClientRect().top;

      const moveAt = (pageX, pageY) => {
        marker.style.left = pageX - shiftX + 'px';
        marker.style.top = pageY - shiftY + 'px';
      };

      const onMouseMove = (event) => {
        moveAt(event.pageX, event.pageY);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener(
        'mouseup',
        () => {
          document.removeEventListener('mousemove', onMouseMove);
        },
        { once: true }
      );
    }
  };

  return (
    <div
      ref={markerRef}
      className={`${styles.markerOptions} nodrag`}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.iconContainer}>
        <span>Stroke Color</span>
        <FaTint
          title="Stroke Color"
          onClick={() => {
            console.log('MarkerOptions: Toggling color picker');
            setShowColorPicker(!showColorPicker);
          }}
          className={styles.icon}
        />
        {showColorPicker && (
          <div className={styles.colorPicker} ref={colorPickerRef}>
            <SketchPicker
              color={currentStroke}
              onChange={(color) => {
                console.log(
                  'MarkerOptions: Changing stroke color to:',
                  `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                );
                setCurrentStroke(
                  `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                );
              }}
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
          onChange={(e) => {
            console.log(
              'MarkerOptions: Changing stroke width to:',
              e.target.value
            );
            setCurrentStrokeWidth(Number(e.target.value));
          }}
          className={styles.strokeWidthInput}
        />
      </div>
    </div>
  );
};

export default MarkerOptions;
