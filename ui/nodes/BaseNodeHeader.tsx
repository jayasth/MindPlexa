import React from 'react';
import styles from './BaseNode.module.css';
import { FaTrash } from 'react-icons/fa';

interface BaseNodeHeaderProps {
  title: string;
  onDelete?: () => void; // Optional if not all nodes need a delete function
  children?: React.ReactNode; // Allow passing additional elements for customization
}

const BaseNodeHeader: React.FC<BaseNodeHeaderProps> = ({
  title,
  onDelete,
  children
}) => {
  return (
    <div className={styles.header}>
      <span className={styles.title}>{title}</span>
      {children}
      {onDelete && (
        <button onClick={onDelete} className={styles.iconButton}>
          <FaTrash className={styles.icon} />
        </button>
      )}
    </div>
  );
};

export default BaseNodeHeader;
