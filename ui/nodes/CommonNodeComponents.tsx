import React from 'react';
import {
  FaSave,
  FaTrash,
  FaPalette,
  FaTags,
  FaPaperclip,
  FaTimes
} from 'react-icons/fa';
import styles from './CommonNodeStyles.module.css';

export const SaveButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Save">
    <FaSave size={16} />
  </button>
);

export const DeleteButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Delete">
    <FaTrash size={16} />
  </button>
);

export const ChangeColorButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Change Color"
  >
    <FaPalette size={16} />
  </button>
);

export const AddTagButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Tag">
    <FaTags size={16} />
  </button>
);

export const AttachFileButton = ({ onChange }) => (
  <label className={styles.actionButton} title="Attach File">
    <FaPaperclip size={16} />
    <input type="file" className={styles.fileInput} onChange={onChange} />
  </label>
);

export const CancelButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Cancel">
    <FaTimes size={16} />
  </button>
);
