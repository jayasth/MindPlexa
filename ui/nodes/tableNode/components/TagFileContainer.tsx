import React from 'react';
import styles from '@/ui/nodes/tableNode/styles/TagFileContainer.module.css';

const TagFileContainer = ({
  tags,
  onRemoveTag,
  textColor,
  attachedFiles,
  onRemoveFile,
  handleAttachmentPreview
}) => (
  <div className={styles.tagFileContainer}>
    <div className={styles.tagContainer}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className={styles.tag}
          style={{ color: textColor }}
          onClick={() => onRemoveTag(tag)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onRemoveTag(tag);
            }
          }}
        >
          #{tag} <button className={styles.removeTagButton}>&times;</button>
        </span>
      ))}
    </div>
    <div className={styles.fileContainer}>
      {attachedFiles.map((file, index) => (
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
            onMouseEnter={() => handleAttachmentPreview(file)}
            onMouseLeave={() => {
              const preview = document.querySelector('.file-preview');
              if (preview) {
                document.body.removeChild(preview);
              }
            }}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (file.type === 'text/plain') {
                  window.open(file.name, '_blank');
                } else {
                  const url = URL.createObjectURL(file);
                  window.open(url, '_blank');
                }
              }
            }}
          >
            {file.name}
          </span>
          <button
            className={styles.removeFileButton}
            onClick={() => onRemoveFile(file)}
            aria-label={`Remove file ${file.name}`}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default TagFileContainer;
