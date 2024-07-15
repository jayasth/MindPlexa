import React from 'react';
import styles from '@/ui/nodes/common/TagFileContainer.module.css';

const TagFileContainer = ({
  tags,
  onRemoveTag,
  textColor,
  attachedFiles,
  onRemoveFile,
  handleAttachmentPreview
}) => {
  const hasContent = tags.length > 0 || attachedFiles.length > 0;

  return (
    <div
      className={`${styles.tagFileContainer} ${hasContent ? styles.withBorder : ''}`}
    >
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span
            key={index}
            className={styles.tag}
            style={{ color: textColor }}
            onClick={() => onRemoveTag(tag)}
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
                if (file.type === 'url') {
                  window.open(file.content, '_blank');
                } else {
                  handleAttachmentPreview(file.content);
                }
              }}
              onMouseEnter={() => handleAttachmentPreview(file.content)}
              onMouseLeave={() => {
                const preview = document.querySelector('.file-preview');
                if (preview) {
                  document.body.removeChild(preview);
                }
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {file.type === 'url' ? new URL(file.content).hostname : file.name}
            </span>
            <button
              className={styles.removeFileButton}
              onClick={() => onRemoveFile(file.content)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagFileContainer;
