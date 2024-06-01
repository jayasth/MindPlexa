import React from 'react';
import {
  FaSave,
  FaTrash,
  FaPalette,
  FaTags,
  FaPaperclip,
  FaArrowRight,
  FaCopy // New import for duplicate icon
} from 'react-icons/fa';
import styles from './CommonNodeStyles.module.css';

const ICON_SIZE = 16;

export const SaveButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Save to Project"
  >
    <FaSave size={ICON_SIZE} />
  </button>
);

export const DeleteButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Delete">
    <FaTrash size={ICON_SIZE} />
  </button>
);

export const ChangeColorButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Change Background Color"
  >
    <FaPalette size={ICON_SIZE} />
  </button>
);

export const AddTagButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Tag">
    <FaTags size={ICON_SIZE} />
  </button>
);

export const AttachFileButton = ({ onChange }) => (
  <label className={styles.actionButton} title="Attach File">
    <FaPaperclip size={ICON_SIZE} />
    <input type="file" className={styles.fileInput} onChange={onChange} />
  </label>
);

export const CloseButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Close">
    <FaArrowRight size={ICON_SIZE} />
  </button>
);

export const DuplicateButton = (
  { onClick } // New Duplicate Button
) => (
  <button className={styles.actionButton} onClick={onClick} title="Duplicate">
    <FaCopy size={ICON_SIZE} />
  </button>
);
