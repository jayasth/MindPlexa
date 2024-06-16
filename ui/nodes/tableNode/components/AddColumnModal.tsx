import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import Button from '@/ui/Button/Button';
import styles from '@/ui/nodes/tableNode/styles/AddColumnModal.module.css';

const validTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'currency', label: 'Currency' }
];

const AddColumnModal = ({ isOpen, onClose, onSave, existingColumns }) => {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');

  const generateColumnId = () => {
    const existingIds = existingColumns.map((col) => col.field);
    let newId;
    let counter = 1;
    do {
      newId = `col${existingColumns.length + counter}`;
      counter++;
    } while (existingIds.includes(newId));
    return newId;
  };

  const handleSave = () => {
    const newColumn = {
      headerName: columnName || `Column ${existingColumns.length + 1}`,
      field: generateColumnId(),
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
