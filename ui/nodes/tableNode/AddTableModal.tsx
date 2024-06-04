import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from './AddTableModal.module.css';

const AddTableModal = ({ onClose, onAddTable, hasExistingData }) => {
  const [columns, setColumns] = useState([
    { name: '', type: 'text', defaultValue: '' }
  ]);
  const [rows, setRows] = useState(1);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const validTypes = [
    'text',
    'number',
    'date',
    'boolean',
    'currency',
    'dropdown'
  ];

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'text', defaultValue: '' }]);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    if (field === 'type' && !validTypes.includes(value)) {
      alert('Invalid type selected.');
      return;
    }
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleAddTable = () => {
    if (hasExistingData) {
      setIsWarningOpen(true);
    } else {
      onAddTable(columns, rows);
      onClose();
    }
  };

  const handleConfirmAddTable = () => {
    onAddTable(columns, rows);
    onClose();
    setIsWarningOpen(false);
  };

  const handleRowsChange = (value) => {
    setRows(parseInt(value, 10));
  };

  return (
    <div className={`${styles.modal} nodrag nowheel`}>
      <div className={styles.modalContent}>
        <h2>Add Table</h2>
        <div className={styles.formGroup}>
          <label>Columns:</label>
          {columns.map((col, index) => (
            <div key={index} className={styles.columnConfig}>
              <Input
                type="text"
                placeholder="Column Name"
                value={col.name}
                onChange={(value) => handleColumnChange(index, 'name', value)}
                variant="slim"
                className={styles.inputWide}
              />
              <Dropdown
                value={col.type}
                onChange={(value) => handleColumnChange(index, 'type', value)}
                variant="slim"
                className={styles.dropdownWide}
              >
                {validTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Dropdown>
              <Input
                type="text"
                placeholder="Default Value"
                value={col.defaultValue}
                onChange={(value) =>
                  handleColumnChange(index, 'defaultValue', value)
                }
                variant="slim"
                className={styles.inputWide}
              />
            </div>
          ))}
          <Button variant="slim" onClick={handleAddColumn}>
            Add Column
          </Button>
        </div>
        <div className={styles.formGroup}>
          <label>Number of Rows:</label>
          <Input
            type="tel"
            value={rows}
            onChange={handleRowsChange}
            min="1"
            max="10"
            variant="slim"
            className={styles.inputNarrow}
          />
        </div>
        <div className={styles.actions}>
          <Button variant="submit" onClick={handleAddTable}>
            Add Table
          </Button>
          <Button variant="cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
      <Modal
        open={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        center
      >
        <h2>Warning</h2>
        <p>This will override existing data. Continue?</p>
        <div className={styles.actions}>
          <Button variant="submit" onClick={handleConfirmAddTable}>
            Yes
          </Button>
          <Button variant="cancel" onClick={() => setIsWarningOpen(false)}>
            No
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AddTableModal;
