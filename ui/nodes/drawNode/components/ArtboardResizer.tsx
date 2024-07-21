import React, { useState, useCallback } from 'react';
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
  const [resizeDirection, setResizeDirection] = useState('');
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startWidth, setStartWidth] = useState(width);
  const [startHeight, setStartHeight] = useState(height);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      setResizing(true);
      setResizeDirection(direction);
      setStartX(e.clientX);
      setStartY(e.clientY);
      setStartWidth(width);
      setStartHeight(height);
    },
    [width, height]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!resizing) return;

      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (resizeDirection) {
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

      onResize(Math.max(newWidth, 100), Math.max(newHeight, 100));
    },
    [
      resizing,
      resizeDirection,
      startWidth,
      startHeight,
      startX,
      startY,
      onResize
    ]
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
