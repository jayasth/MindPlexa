import React from 'react';
import Modal from '@/ui/Modal/Modal';
import Button from '@/ui/Button/Button';
import styles from './FileSizeWarningModal.module.css';

interface FileSizeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  oversizedFiles: string[];
}

const FileSizeWarningModal: React.FC<FileSizeWarningModalProps> = ({
  isOpen,
  onClose,
  oversizedFiles
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="File Size Limit Exceeded">
      <div className={styles.content}>
        <p>
          The following files exceed the 2MB limit and will not be uploaded:
        </p>
        <ul className={styles.fileList}>
          {oversizedFiles.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button variant="submit" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FileSizeWarningModal;
