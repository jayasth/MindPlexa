import React from 'react';
import { Modal } from 'react-responsive-modal';
import Button from '@/ui/Button/Button';
import styles from '@/ui/nodes/tableNode/styles/DeleteTableModal.module.css';

const DeleteTableModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal open={isOpen} onClose={onClose} center>
    <h2>Confirm Deletion</h2>
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
