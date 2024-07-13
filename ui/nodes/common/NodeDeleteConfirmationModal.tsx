import React from 'react';
import { Modal } from 'react-responsive-modal';
import Button from '@/ui/Button/Button';
import styles from '@/ui/nodes/common/CommonNodeStyles.module.css';

interface NodeDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const NodeDeleteConfirmationModal: React.FC<
  NodeDeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal open={isOpen} onClose={onClose} center>
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete this node?</p>
      <div className={styles.modalButtonContainer}>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default NodeDeleteConfirmationModal;
