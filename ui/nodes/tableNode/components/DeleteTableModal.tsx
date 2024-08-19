import React from 'react';
import Modal from '@/ui/Modal/Modal';
import Button from '@/ui/Button/Button';
import styles from '../styles/DeleteTableModal.module.css';

const DeleteTableModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
    <p>
      Are you sure you want to delete the entire table? This action cannot be
      undone.
    </p>
    <div className={styles.actions}>
      <Button variant="submit" onClick={onConfirm}>
        Yes
      </Button>
      <Button variant="cancel" onClick={onClose}>
        Cancel
      </Button>
    </div>
  </Modal>
);

export default DeleteTableModal;
