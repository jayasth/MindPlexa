import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import styles from './ConfirmIntegrationModal.module.css';

interface ConfirmIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmIntegrationModal: React.FC<ConfirmIntegrationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: styles.customModal
      }}
    >
      <h2 className={styles.modalTitle}>Confirm Integration</h2>
      <p className={styles.modalText}>
        Do you want to integrate the AI-generated diagram with your existing
        work?
      </p>
      <div className={styles.buttons}>
        <Button onClick={onConfirm} variant="submit">
          Yes
        </Button>
        <Button onClick={onCancel} variant="cancel">
          No
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmIntegrationModal;
