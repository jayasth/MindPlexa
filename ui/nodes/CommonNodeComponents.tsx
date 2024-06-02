import React, { useState } from 'react';
import {
  FaSave,
  FaTrash,
  FaPalette,
  FaTags,
  FaPaperclip,
  FaArrowRight,
  FaCopy
} from 'react-icons/fa';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
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

export const DuplicateButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Duplicate">
    <FaCopy size={ICON_SIZE} />
  </button>
);

export const TagModal = ({ isOpen, onClose, onAddTag }) => {
  const [newTags, setNewTags] = useState('');

  const handleAddTags = () => {
    const tagList = newTags.split(',').map((tag) => tag.trim());
    onAddTag(tagList);
    setNewTags('');
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <h2>Add Tags</h2>
      <input
        type="text"
        value={newTags}
        onChange={(e) => setNewTags(e.target.value)}
        placeholder="Enter tags, separated by commas"
      />
      <button onClick={handleAddTags}>Add Tags</button>
    </Modal>
  );
};
