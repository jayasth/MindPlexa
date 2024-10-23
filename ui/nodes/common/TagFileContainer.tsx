import React from 'react';
import styles from '@/ui/nodes/common/TagFileContainer.module.css';
import {
  Attachment,
  removeAttachment,
  handleAttachmentPreview,
  downloadAttachment,
  removeAllPreviews
} from '@/utils/canvas/attachmentService';

interface TagFileContainerProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
  textColor: string;
  attachedFiles: Attachment[];
  onRemoveFile: (fileId: string) => void;
}

const TagFileContainer: React.FC<TagFileContainerProps> = ({
  tags,
  onRemoveTag,
  textColor,
  attachedFiles,
  onRemoveFile
}) => {
  const hasContent = tags.length > 0 || attachedFiles.length > 0;

  const handleRemoveFile = async (fileId: string) => {
    await removeAttachment(fileId);
    onRemoveFile(fileId);
  };

  const handlePreview = async (attachment: Attachment) => {
    removeAllPreviews(); // Remove any existing previews
    const removePreview = await handleAttachmentPreview(attachment);
    return removePreview;
  };

  const handleMouseLeave = () => {
    removeAllPreviews();
  };

  const handleDownloadFile = async (attachment: Attachment) => {
    await downloadAttachment(attachment);
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
        {attachedFiles.map((attachment) => (
          <div
            key={attachment.id}
            className={styles.file}
            style={{ color: textColor }}
          >
            <span
              onClick={() => {
                if (attachment.type === 'url') {
                  window.open(attachment.url!, '_blank');
                } else {
                  handleDownloadFile(attachment);
                }
              }}
              onMouseEnter={() => handlePreview(attachment)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {attachment.type === 'url'
                ? new URL(attachment.url!).hostname
                : attachment.file_name}
            </span>
            <button
              className={styles.removeFileButton}
              onClick={() => handleRemoveFile(attachment.id)}
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
