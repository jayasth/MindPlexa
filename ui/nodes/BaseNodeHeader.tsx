import React from 'react';
import styles from './BaseNode.module.css';
import { FaTrash } from 'react-icons/fa';

interface BaseNodeHeaderProps {
  title: string;
  onDelete: () => void;
}

const BaseNodeHeader: React.FC<BaseNodeHeaderProps> = ({ title, onDelete }) => {
  return (
    <div className={styles.header}>
      <span className={styles.title}>{title}</span>
      <button onClick={onDelete} className={styles.iconButton}>
        <FaTrash className={styles.icon} />
      </button>
    </div>
  );
};

export default BaseNodeHeader;
