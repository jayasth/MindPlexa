import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import Button from '@/ui/Button/Button';
import styles from '@/ui/nodes/tableNode/styles/AddColumnModal.module.css';
import { v4 as uuidv4 } from 'uuid';

const validTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'currency', label: 'Currency' }
];

const AddColumnModal = ({ isOpen, onClose, onSave }) => {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');

  const handleSave = () => {
    const newColumn = {
      id: uuidv4(),
      headerName: columnName || `Column ${uuidv4().slice(0, 4)}`,
      field: `col${uuidv4()}`,
      type: columnType,
      editable: true
    };
    onSave(newColumn);
    onClose();
  };

  const handleColumnNameChange = (value) => {
    setColumnName(value);
  };

  const handleColumnTypeChange = (value) => {
    setColumnType(value);
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <div className={styles.modalContent}>
        <h2>Add Column</h2>
        <Input
          type="text"
          placeholder="Column Name"
          value={columnName}
          onChange={handleColumnNameChange}
          variant="slim"
        />
        <Dropdown
          value={columnType}
          onChange={handleColumnTypeChange}
          variant="slim"
        >
          {validTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Dropdown>
        <Button variant="submit" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default AddColumnModal;
