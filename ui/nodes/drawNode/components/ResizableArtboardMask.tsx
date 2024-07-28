import React, { useState, useCallback } from 'react';
import styles from './ResizableArtboardMask.module.css';

interface ResizableArtboardMaskProps {
  initialWidth: number;
  initialHeight: number;
  children: React.ReactNode;
}

const ResizableArtboardMask: React.FC<ResizableArtboardMaskProps> = ({
  initialWidth,
  initialHeight,
  children
}) => {
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight
  });

  const handleResize = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, direction: string) => {
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = size.width;
      const startHeight = size.height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (direction.includes('left') || direction.includes('right')) {
          const newWidth =
            startWidth + (direction.includes('right') ? deltaX : -deltaX);
          setSize((prevSize) => ({
            ...prevSize,
            width: Math.max(newWidth, 100)
          }));
        }
        if (direction.includes('top') || direction.includes('bottom')) {
          const newHeight =
            startHeight + (direction.includes('bottom') ? deltaY : -deltaY);
          setSize((prevSize) => ({
            ...prevSize,
            height: Math.max(newHeight, 100)
          }));
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [size]
  );

  return (
    <div
      className={styles.maskContainer}
      style={{ width: size.width, height: size.height }}
    >
      {children}
      <div
        className={`${styles.resizeHandle} ${styles.top}`}
        onMouseDown={(e) => handleResize(e, 'top')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.topRight}`}
        onMouseDown={(e) => handleResize(e, 'top-right')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.right}`}
        onMouseDown={(e) => handleResize(e, 'right')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.bottomRight}`}
        onMouseDown={(e) => handleResize(e, 'bottom-right')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.bottom}`}
        onMouseDown={(e) => handleResize(e, 'bottom')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.bottomLeft}`}
        onMouseDown={(e) => handleResize(e, 'bottom-left')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.left}`}
        onMouseDown={(e) => handleResize(e, 'left')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.topLeft}`}
        onMouseDown={(e) => handleResize(e, 'top-left')}
      />
    </div>
  );
};

export default ResizableArtboardMask;
