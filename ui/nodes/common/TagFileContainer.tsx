import React from 'react';
import styles from '@/ui/nodes/common/TagFileContainer.module.css';
import { Attachment, removeAttachment } from '@/utils/canvas/attachmentService';

interface TagFileContainerProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
  textColor: string;
  attachedFiles: Attachment[];
  onRemoveFile: (fileId: string) => void;
  handleAttachmentPreview: (file: Attachment) => void;
}

const TagFileContainer: React.FC<TagFileContainerProps> = ({
  tags,
  onRemoveTag,
  textColor,
  attachedFiles,
  onRemoveFile,
  handleAttachmentPreview
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
                  window.open(file.url!, '_blank');
                } else {
                  handleAttachmentPreview(file);
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
              {file.type === 'url'
                ? new URL(file.url!).hostname
                : file.file_name}
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
