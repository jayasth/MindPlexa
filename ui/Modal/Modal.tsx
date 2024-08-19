import React from 'react';
import { Modal as ResponsiveModal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <ResponsiveModal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: styles.modal,
        closeButton: styles.closeButton
      }}
    >
      {title && <h2 className={styles.modalTitle}>{title}</h2>}
      <div className={styles.modalContent}>{children}</div>
    </ResponsiveModal>
  );
};

export default Modal;
