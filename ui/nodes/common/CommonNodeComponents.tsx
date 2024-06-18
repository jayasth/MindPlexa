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
import { CompactPicker } from 'react-color';
import styles from '@/ui/nodes/common/CommonNodeStyles.module.css';
import Input from '@/ui/Input/Input';
import Button from '@/ui/Button/Button';
import { handleAttachmentPreview } from '@/ui/nodes/common/CommonNodeFunctions';
import {
  updateNode,
  attachFileToNode,
  removeFileFromNode
} from '@/utils/canvas/canvasDatabaseOperations';

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
  existingTags,
  data
}) => {
  const [newTags, setNewTags] = useState('');

  const handleAddTags = async () => {
    const tagList = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    const updatedTags = [...(existingTags || []), ...tagList];
    const { error } = await updateNode(data.id, {
      data: { tags: updatedTags }
    });
    if (error) {
      console.error('Error updating node tags:', error);
      // Handle the error appropriately (e.g., show an error message)
    } else {
      onAddTag(tagList);
      setNewTags('');
    }
  };

  const handleRemoveTag = async (tag) => {
    const updatedTags = (existingTags || []).filter((t) => t !== tag);
    const { error } = await updateNode(data.id, {
      data: { tags: updatedTags }
    });
    if (error) {
      console.error('Error updating node tags:', error);
      // Handle the error appropriately (e.g., show an error message)
    } else {
      onRemoveTag(tag);
    }
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
              onClick={() => handleRemoveTag(tag)}
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
  existingFiles,
  data
}) => {
  const [fileUrl, setFileUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const allFiles = [...existingFiles, ...files];
      if (allFiles.length > 10) {
        alert('You can attach a maximum of 10 files.');
        return;
      }
      const { error } = await attachFileToNode(data.id, files.length);
      if (error) {
        console.error('Error attaching files to node:', error);
        // Handle the error appropriately (e.g., show an error message)
      } else {
        onAttachFiles(allFiles);
      }
    }
  };

  const handleAddFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddFileUrl = async () => {
    if (fileUrl) {
      try {
        new URL(fileUrl); // Validate URL
        const file = new File([fileUrl], fileUrl, { type: 'text/plain' });
        const allFiles = [...existingFiles, file];
        if (allFiles.length > 10) {
          alert('You can attach a maximum of 10 files.');
          return;
        }
        const { error } = await attachFileToNode(data.id, 1);
        if (error) {
          console.error('Error attaching files to node:', error);
          // Handle the error appropriately (e.g., show an error message)
        } else {
          onAttachFiles(allFiles);
          setFileUrl('');
        }
      } catch (e) {
        alert('Invalid URL');
      }
    }
  };

  const handleRemoveFile = async (file) => {
    const { error } = await removeFileFromNode(data.id, file.id);
    if (error) {
      console.error('Error removing file from node:', error);
      // Handle the error appropriately (e.g., show an error message)
    } else {
      onRemoveFile(file);
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
              onClick={() => handleAttachmentPreview(file)}
              onMouseEnter={() => handleAttachmentPreview(file)}
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
              onClick={() => handleRemoveFile(file)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export const ColorPickerModal = ({
  isOpen,
  onClose,
  onChangeColor,
  currentColor,
  colorCombinations
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} center>
      <h2>Change Background Color</h2>
      <CompactPicker
        color={currentColor}
        onChange={onChangeColor}
        colors={colorCombinations.map((combination) => combination.background)}
        styles={{
          default: {
            input: {
              height: '16px',
              fontSize: '12px'
            },
            swatch: {
              width: '20px',
              height: '20px',
              position: 'relative'
            }
          }
        }}
        width="180px"
        className="compact-picker"
      />
      {colorCombinations.map((combination) => (
        <div
          key={combination.background}
          className="compact-picker__swatch"
          style={{ backgroundColor: combination.background }}
          title={combination.name}
        />
      ))}
    </Modal>
  );
};
