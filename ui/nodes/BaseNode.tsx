import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from './BaseNode.module.css';
import {
  FaTrash,
  FaPalette,
  FaExpand,
  FaTag,
  FaPaperclip
} from 'react-icons/fa';

interface BaseNodeProps {
  title: string;
  onDelete: () => void;
  onChangeColor: () => void;
  onResize: () => void;
  onTag: () => void;
  onAttach: () => void;
  children: React.ReactNode; // For specific node content
}

const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  onDelete,
  onChangeColor,
  onResize,
  onTag,
  onAttach,
  children
}) => {
  return (
    <div className={styles.baseNode}>
      <div className={styles.header}>
        <span>{title}</span>
        <button onClick={onDelete} className={styles.iconButton}>
          <FaTrash />
        </button>
      </div>
      {children}
      <div className={styles.footer}>
        <button onClick={onChangeColor} className={styles.iconButton}>
          <FaPalette />
        </button>
        <button onClick={onResize} className={styles.iconButton}>
          <FaExpand />
        </button>
        <button onClick={onTag} className={styles.iconButton}>
          <FaTag />
        </button>
        <button onClick={onAttach} className={styles.iconButton}>
          <FaPaperclip />
        </button>
      </div>
    </div>
  );
};

export default BaseNode;
