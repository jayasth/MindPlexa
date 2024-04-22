import React from 'react';
import styles from './BaseNode.module.css';
import { FaPalette, FaExpand, FaTag, FaPaperclip } from 'react-icons/fa';

interface BaseNodeFooterProps {
  onChangeColor: () => void;
  onResize: () => void;
  onTag: () => void;
  onAttach: () => void;
}

const BaseNodeFooter: React.FC<BaseNodeFooterProps> = ({
  onChangeColor,
  onResize,
  onTag,
  onAttach
}) => {
  return (
    <div
      className={`${styles.footer} flex justify-around bg-myGray-100 rounded-b-sm`}
    >
      <button onClick={onChangeColor} className={styles.iconButton}>
        <FaPalette className="text-xs" />
      </button>
      <button onClick={onResize} className={styles.iconButton}>
        <FaExpand className="text-xs" />
      </button>
      <button onClick={onTag} className={styles.iconButton}>
        <FaTag className="text-xs" />
      </button>
      <button onClick={onAttach} className={styles.iconButton}>
        <FaPaperclip className="text-xs" />
      </button>
    </div>
  );
};

export default BaseNodeFooter;
