import React from 'react';
import Button from '@/ui/Button/Button';
import styles from '@/ui/ai/generator/ConfirmIntegrationModal.module.css';

interface ConfirmIntegrationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmIntegrationModal: React.FC<ConfirmIntegrationModalProps> = ({
  onConfirm,
  onCancel
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalHeader}>Confirm Integration</h2>
        <p>
          Do you want to integrate the AI-generated diagram with your existing
          work?
        </p>
        <div className={styles.buttonContainer}>
          <Button onClick={onConfirm} variant="slim">
            Yes
          </Button>
          <Button onClick={onCancel} variant="slim">
            No
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmIntegrationModal;
