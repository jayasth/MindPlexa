import React from 'react';
import Modal from '@/ui/Modal/Modal';
import Button from '@/ui/Button/Button';
import styles from '@/ui/Modal/DeleteCanvasModal.module.css';

interface DeleteCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteOption: 'canvasOnly' | 'withNodes') => void;
  hasNodes: boolean;
  hasSharedNodes: boolean;
}

const DeleteCanvasModal: React.FC<DeleteCanvasModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hasNodes,
  hasSharedNodes
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
    <div className={styles.content}>
      {hasNodes ? (
        <>
          <p className={styles.text}>
            This canvas contains nodes. Do you want to delete the canvas only or
            delete the canvas and its nodes (except shared ones)?
          </p>
          {hasSharedNodes && (
            <p className={styles.text}>
              Some nodes in this canvas are shared with other canvases. These
              shared nodes will not be deleted.
            </p>
          )}
          <div className={styles.actions}>
            <Button variant="sleek" onClick={() => onConfirm('canvasOnly')}>
              Delete Canvas Only
            </Button>
            <Button variant="danger" onClick={() => onConfirm('withNodes')}>
              Delete Canvas and Nodes
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.text}>
            Are you sure you want to delete this canvas? This action cannot be
            undone.
          </p>
          <div className={styles.actions}>
            <Button variant="danger" onClick={() => onConfirm('canvasOnly')}>
              Yes, Delete Canvas
            </Button>
          </div>
        </>
      )}
    </div>
  </Modal>
);

export default DeleteCanvasModal;
