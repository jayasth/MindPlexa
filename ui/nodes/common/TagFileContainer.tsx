import React from 'react';
import styles from '@/ui/nodes/common/TagFileContainer.module.css';
import {
  removeAttachment,
  handleAttachmentPreview
} from '@/utils/canvas/attachmentService';

const TagFileContainer = ({
  tags,
  onRemoveTag,
  textColor,
  attachedFiles,
  onRemoveFile,
  handleAttachmentPreview: externalHandleAttachmentPreview
}) => {
  const hasContent = tags.length > 0 || attachedFiles.length > 0;

  const handleRemoveFile = async (fileId: string) => {
    await removeAttachment(fileId);
    onRemoveFile(fileId);
  };

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
        {attachedFiles.map((file) => (
          <div key={file.id} className={styles.file}>
            <span
              onClick={() => {
                if (file.type === 'url') {
                  window.open(file.url, '_blank');
                } else {
                  externalHandleAttachmentPreview(file);
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
            >
              {file.type === 'url' ? new URL(file.url).hostname : file.fileName}
            </span>
            <button
              className={styles.removeFileButton}
              onClick={() => handleRemoveFile(file.id)}
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
