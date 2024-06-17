import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from '@/ui/Modal/Modal.module.css';

const locales = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'fr-FR', label: 'French (France)' }
  // Add more locales as needed
];

const SettingsModal = ({ isOpen, onClose, onSave, initialLocale }) => {
  const [locale, setLocale] = useState(initialLocale);

  const handleSave = () => {
    onSave(locale);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <div className={styles.modalContent}>
        <h2>Settings</h2>
        <div className={styles.formGroup}>
          <label>Locale:</label>
          <Dropdown
            value={locale}
            onChange={(value) => setLocale(value)}
            variant="slim"
          >
            {locales.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
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
