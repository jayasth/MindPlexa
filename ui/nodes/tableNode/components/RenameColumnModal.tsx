import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import Button from '@/ui/Button/Button';
import modalStyles from '@/ui/Modal/Modal.module.css';

const validTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'currency', label: 'Currency' }
];

interface Column {
  headerName: string;
  type: string;
}

interface RenameColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: Column;
  onSave: (name: string, type: string) => void;
}

const RenameColumnModal: React.FC<RenameColumnModalProps> = ({
  isOpen,
  onClose,
  column,
  onSave
}) => {
  const [columnName, setColumnName] = useState(column.headerName);
  const [columnType, setColumnType] = useState(column.type);

  useEffect(() => {
    setColumnName(column.headerName);
    setColumnType(column.type);
  }, [column]);

  const handleSave = () => {
    onSave(columnName, columnType);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <div className={modalStyles.modal}>
        <h2 className={modalStyles.modalHeader}>Rename Column</h2>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Column Name:</label>
          <Input
            type="text"
            value={columnName}
            onChange={(value: string) => setColumnName(value)}
            variant="slim"
            className={modalStyles.inputWide}
          />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Column Type:</label>
          <Dropdown
            value={columnType}
            onChange={(value: string) => setColumnType(value)}
            variant="slim"
            className={modalStyles.dropdownWide}
          >
            {validTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Dropdown>
        </div>
        <div className={modalStyles.actions}>
          <Button variant="submit" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RenameColumnModal;
