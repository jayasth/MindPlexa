import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from '@/ui/Modal/Modal.module.css';

const dateFormats = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }
];

const SettingsModal = ({
  isOpen,
  onClose,
  onSave,
  initialDateFormat,
  handleDateFormatChange
}) => {
  const [dateFormat, setDateFormat] = useState(initialDateFormat);

  useEffect(() => {
    setDateFormat(initialDateFormat);
  }, [initialDateFormat]);

  const handleSave = () => {
    onSave({ dateFormat });
    onClose();
  };

  const handleLocalDateFormatChange = (newDateFormat) => {
    setDateFormat(newDateFormat);
    handleDateFormatChange(newDateFormat);
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <div className={styles.modalContent}>
        <h2>Settings</h2>
        <div className={styles.formGroup}>
          <label>Date Format:</label>
          <Dropdown
            value={dateFormat}
            onChange={handleLocalDateFormatChange}
            variant="slim"
          >
            {dateFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </Dropdown>
        </div>
        <div className={styles.actions}>
          <Button variant="submit" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
