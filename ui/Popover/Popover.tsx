import React, { useState, useRef, useEffect } from 'react';
import styles from './Popover.module.css';

interface PopoverProps {
  trigger: React.ReactElement;
  content: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.popoverContainer} ref={popoverRef}>
      {React.cloneElement(trigger, {
        onClick: () => setIsOpen(!isOpen)
      })}
      {isOpen && <div className={styles.popoverContent}>{content}</div>}
    </div>
  );
};
