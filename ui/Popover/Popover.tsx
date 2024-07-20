import React, { useState, useRef } from 'react';
import styles from './Popover.module.css';
import useClickOutside from '@/hooks/useClickOutside';

interface PopoverProps {
  trigger: React.ReactElement;
  content: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useClickOutside(popoverRef, () => setIsOpen(false));

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.popoverContainer}>
      <div ref={triggerRef} onClick={togglePopover}>
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={popoverRef}
          className={styles.popoverContent}
          style={{
            position: 'absolute',
            top: triggerRef.current ? triggerRef.current.offsetHeight + 5 : 0,
            left: 0
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
