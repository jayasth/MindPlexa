import React, { useState, useCallback, useRef } from 'react';
import styles from './ArtboardResizer.module.css';

interface ArtboardResizerProps {
  width: number;
  height: number;
  onResize: (newWidth: number, newHeight: number) => void;
}

const ArtboardResizer: React.FC<ArtboardResizerProps> = ({
  width,
  height,
  onResize
}) => {
  const [resizing, setResizing] = useState(false);
  const resizeInfo = useRef({
    direction: '',
    startX: 0,
    startY: 0,
    startWidth: width,
    startHeight: height
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      setResizing(true);
      resizeInfo.current = {
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: width,
        startHeight: height
      };
    },
    [width, height]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!resizing) return;

      const { direction, startX, startY, startWidth, startHeight } =
        resizeInfo.current;
      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (direction) {
        case 'right':
          newWidth = startWidth + e.clientX - startX;
          break;
        case 'bottom':
          newHeight = startHeight + e.clientY - startY;
          break;
        case 'left':
          newWidth = startWidth - (e.clientX - startX);
          break;
        case 'top':
          newHeight = startHeight - (e.clientY - startY);
          break;
        case 'topLeft':
          newWidth = startWidth - (e.clientX - startX);
          newHeight = startHeight - (e.clientY - startY);
          break;
        case 'topRight':
          newWidth = startWidth + e.clientX - startX;
          newHeight = startHeight - (e.clientY - startY);
          break;
        case 'bottomLeft':
          newWidth = startWidth - (e.clientX - startX);
          newHeight = startHeight + e.clientY - startY;
          break;
        case 'bottomRight':
          newWidth = startWidth + e.clientX - startX;
          newHeight = startHeight + e.clientY - startY;
          break;
      }

      onResize(newWidth, newHeight);
    },
    [resizing, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setResizing(false);
  }, []);

  return (
    <>
      <div
        className={`${styles.handle} ${styles.handleTop}`}
        onMouseDown={(e) => handleMouseDown(e, 'top')}
      />
      <div
        className={`${styles.handle} ${styles.handleRight}`}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />
      <div
        className={`${styles.handle} ${styles.handleBottom}`}
        onMouseDown={(e) => handleMouseDown(e, 'bottom')}
      />
      <div
        className={`${styles.handle} ${styles.handleLeft}`}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />
      <div
        className={`${styles.handle} ${styles.handleTopLeft}`}
        onMouseDown={(e) => handleMouseDown(e, 'topLeft')}
      />
      <div
        className={`${styles.handle} ${styles.handleTopRight}`}
        onMouseDown={(e) => handleMouseDown(e, 'topRight')}
      />
      <div
        className={`${styles.handle} ${styles.handleBottomLeft}`}
        onMouseDown={(e) => handleMouseDown(e, 'bottomLeft')}
      />
      <div
        className={`${styles.handle} ${styles.handleBottomRight}`}
        onMouseDown={(e) => handleMouseDown(e, 'bottomRight')}
      />
      {resizing && (
        <div
          className={styles.overlay}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      )}
    </>
  );
};

export default ArtboardResizer;
