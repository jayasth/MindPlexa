import React from 'react';
import styles from './BaseNode.module.css';
import { FaPalette, FaTag, FaPaperclip } from 'react-icons/fa';

interface BaseNodeFooterProps {
  onChangeColor: () => void;
  onTag: () => void;
  onAttach: () => void;
}

const BaseNodeFooter: React.FC<BaseNodeFooterProps> = ({
  onChangeColor,
  onTag,
  onAttach
}) => {
  return (
    <div className={styles.footer}>
      <button onClick={onChangeColor} className={styles.iconButton}>
        <FaPalette className={styles.icon} />
      </button>
      <button onClick={onTag} className={styles.iconButton}>
        <FaTag className={styles.icon} />
      </button>
      <button onClick={onAttach} className={styles.iconButton}>
        <FaPaperclip className={styles.icon} />
      </button>
    </div>
  );
};

export default BaseNodeFooter;
