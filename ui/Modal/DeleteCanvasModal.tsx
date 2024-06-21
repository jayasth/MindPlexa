import React from 'react';
import { Modal } from 'react-responsive-modal';
import Button from '@/ui/Button/Button';
import styles from '@/ui/Modal/Modal.module.css';

const DeleteCanvasModal = ({
  isOpen,
  onClose,
  onConfirm,
  hasNodes,
  hasSharedNodes
}) => (
  <Modal open={isOpen} onClose={onClose} center>
    <h2>Confirm Deletion</h2>
    {hasNodes ? (
      <>
        <p>
          This canvas contains nodes. Do you want to delete the canvas only or
          delete the canvas and its nodes (except shared ones)?
        </p>
        {hasSharedNodes && (
          <p>
            Some nodes in this canvas are shared with other canvases. These
            shared nodes will not be deleted.
          </p>
        )}
        <div className={styles.actions}>
          <Button variant="submit" onClick={() => onConfirm('canvasOnly')}>
            Delete Canvas Only
          </Button>
          <Button variant="danger" onClick={() => onConfirm('withNodes')}>
            Delete Canvas and Nodes (except shared ones)
          </Button>
          <Button variant="cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </>
    ) : (
      <>
        <p>
          Are you sure you want to delete this canvas? This action cannot be
          undone.
        </p>
        <div className={styles.actions}>
          <Button variant="submit" onClick={() => onConfirm('canvasOnly')}>
            Yes
          </Button>
          <Button variant="cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </>
    )}
  </Modal>
);

export default DeleteCanvasModal;
