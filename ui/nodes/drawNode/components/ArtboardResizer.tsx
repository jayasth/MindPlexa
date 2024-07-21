import React, { useState } from 'react';
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
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startWidth, setStartWidth] = useState(width);
  const [startHeight, setStartHeight] = useState(height);

  const handleMouseDown = (e: React.MouseEvent) => {
    setResizing(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setStartWidth(width);
    setStartHeight(height);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!resizing) return;

    const newWidth = startWidth + e.clientX - startX;
    const newHeight = startHeight + e.clientY - startY;

    onResize(Math.max(newWidth, 100), Math.max(newHeight, 100));
  };

  const handleMouseUp = () => {
    setResizing(false);
  };

  return (
    <div
      className={styles.resizer}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={`${styles.handle} ${styles.handleRight}`} />
      <div className={`${styles.handle} ${styles.handleBottom}`} />
      <div className={`${styles.handle} ${styles.handleCorner}`} />
    </div>
  );
};

export default ArtboardResizer;
