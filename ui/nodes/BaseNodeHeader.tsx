import React from 'react';
import styles from './BaseNode.module.css';
import { FaTrash } from 'react-icons/fa';

interface BaseNodeHeaderProps {
  title: string;
  onDelete: () => void;
}

const BaseNodeHeader: React.FC<BaseNodeHeaderProps> = ({ title, onDelete }) => {
  return (
    <div
      className={`${styles.header} flex justify-between items-center text-xs bg-myGray-100 rounded-t-sm`}
    >
      <span>{title}</span>
      <button onClick={onDelete} className={styles.iconButton}>
        <FaTrash />
      </button>
    </div>
  );
};

export default BaseNodeHeader;
