import React from 'react';
import Modal from '@/ui/Modal/Modal';
import Button from '@/ui/Button/Button';
import styles from '@/ui/Modal/Modal.module.css';

interface NodeDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const NodeDeleteConfirmationModal: React.FC<
  NodeDeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className={styles.modalText}>
        Are you sure you want to delete this node?
      </p>
      <div className={styles.actions}>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default NodeDeleteConfirmationModal;
