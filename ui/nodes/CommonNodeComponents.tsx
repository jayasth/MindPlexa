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
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import styles from './CommonNodeStyles.module.css';
import Input from '@/ui/Input/Input';
import Button from '@/ui/Button/Button';

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

export const TagModal = ({
  isOpen,
  onClose,
  onAddTag,
  onRemoveTag,
  existingTags
}) => {
  const [newTags, setNewTags] = useState('');

  const handleAddTags = () => {
    const tagList = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    onAddTag(tagList);
    setNewTags('');
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <h2>Add Tags</h2>
      <Input
        variant="slim"
        value={newTags}
        onChange={(value) => setNewTags(value)}
        placeholder="Enter tags, separated by commas"
      />
      <Button variant="slim" onClick={handleAddTags}>
        Add Tags
      </Button>
      <div className={styles.tagList}>
        {existingTags.map((tag) => (
          <div key={tag} className={styles.tag}>
            <span>#{tag}</span>
            <button
              className={styles.removeTagButton}
              onClick={() => onRemoveTag(tag)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
};
