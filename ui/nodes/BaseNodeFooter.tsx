import React from 'react';
import styles from './BaseNode.module.css';
import { FaPalette, FaTag, FaPaperclip } from 'react-icons/fa';

interface BaseNodeFooterProps {
  onChangeColor?: () => void; // Optional if not all nodes need to change color
  onTag?: () => void; // Optional if not all nodes need tagging
  onAttach?: () => void; // Optional if not all nodes need attachments
  children?: React.ReactNode; // Allow passing additional elements for customization
}

const BaseNodeFooter: React.FC<BaseNodeFooterProps> = ({
  onChangeColor,
  onTag,
  onAttach,
  children
}) => {
  return (
    <div className={styles.footer}>
      {onChangeColor && (
        <button onClick={onChangeColor} className={styles.iconButton}>
          <FaPalette className={styles.icon} />
        </button>
      )}
      {onTag && (
        <button onClick={onTag} className={styles.iconButton}>
          <FaTag className={styles.icon} />
        </button>
      )}
      {onAttach && (
        <button onClick={onAttach} className={styles.iconButton}>
          <FaPaperclip className={styles.icon} />
        </button>
      )}
      {children}
    </div>
  );
};

export default BaseNodeFooter;
