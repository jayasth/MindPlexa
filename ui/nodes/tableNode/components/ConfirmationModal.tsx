import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import styles from '@/ui/Modal/Modal.module.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{ modal: styles.modal }}
    >
      <div className={styles.modalContent}>
        <h2>Warning</h2>
        <p>{message}</p>
        <div className={styles.actions}>
          <Button variant="submit" onClick={onConfirm}>
            Yes
          </Button>
          <Button variant="cancel" onClick={onClose}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
