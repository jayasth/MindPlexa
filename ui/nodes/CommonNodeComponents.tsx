import React, { useState, useRef } from 'react';
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

export const AttachFileButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Attach File">
    <FaPaperclip size={ICON_SIZE} />
  </button>
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
        className={styles.input}
      />
      <Button variant="slim" onClick={handleAddTags} className={styles.button}>
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

export const FileModal = ({
  isOpen,
  onClose,
  onAttachFiles,
  onRemoveFile,
  existingFiles
}) => {
  const [fileUrl, setFileUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const allFiles = [...existingFiles, ...files];
      if (allFiles.length > 10) {
        alert('You can attach a maximum of 10 files.');
        return;
      }
      onAttachFiles(allFiles);
    }
  };

  const handleAddFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddFileUrl = () => {
    if (fileUrl) {
      try {
        new URL(fileUrl); // Validate URL
        const fileName = fileUrl.split('/').pop() || 'file';
        const file = new File([fileUrl], fileName, { type: 'text/plain' });
        const allFiles = [...existingFiles, file];
        if (allFiles.length > 10) {
          alert('You can attach a maximum of 10 files.');
          return;
        }
        onAttachFiles(allFiles);
        setFileUrl('');
      } catch (e) {
        alert('Invalid URL');
      }
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <h2>Attach Files</h2>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className={styles.fileInput}
        ref={fileInputRef}
      />
      <Button variant="slim" onClick={handleAddFiles} className={styles.button}>
        Add Files
      </Button>
      <Input
        variant="slim"
        value={fileUrl}
        onChange={(value) => setFileUrl(value)}
        placeholder="Enter file URL"
        className={styles.input}
      />
      <Button
        variant="slim"
        onClick={handleAddFileUrl}
        className={styles.button}
      >
        Add URL Link
      </Button>
      <div className={styles.fileList}>
        {existingFiles.map((file, index) => (
          <div key={index} className={styles.file}>
            <span
              onClick={() => {
                if (file.type === 'text/plain') {
                  window.open(file.name, '_blank');
                } else {
                  const url = URL.createObjectURL(file);
                  window.open(url, '_blank');
                }
              }}
              onMouseEnter={(e) => {
                if (file.type.startsWith('image/')) {
                  const preview = document.createElement('img');
                  preview.src = URL.createObjectURL(file);
                  preview.style.position = 'absolute';
                  preview.style.top = `${e.clientY}px`;
                  preview.style.left = `${e.clientX}px`;
                  preview.style.width = '100px';
                  preview.style.height = '100px';
                  preview.style.zIndex = '1000';
                  preview.className = 'file-preview';
                  document.body.appendChild(preview);
                }
              }}
              onMouseLeave={() => {
                const preview = document.querySelector('.file-preview');
                if (preview) {
                  document.body.removeChild(preview);
                }
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {file.name}
            </span>
            <button
              className={styles.removeFileButton}
              onClick={() => onRemoveFile(file)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
};
