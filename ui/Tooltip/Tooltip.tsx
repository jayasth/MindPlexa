import React, { useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  hideOnClick?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  hideOnClick = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (hideOnClick) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hideOnClick]);

  return (
    <div
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      ref={containerRef}
    >
      {children}
      {isVisible && (
        <div className={styles.tooltipContent} ref={tooltipRef}>
          {content}
        </div>
      )}
    </div>
  );
};
