import React, { useState } from 'react';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from './AddTableModal.module.css';

const AddTableModal = ({ onClose, onAddTable }) => {
  const [columns, setColumns] = useState([{ name: '', type: 'text' }]);
  const [rows, setRows] = useState(1);
  const validTypes = ['text', 'number', 'date', 'boolean', 'currency'];

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'text' }]);
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
    if (columns.length > 0 || rows > 0) {
      if (!window.confirm('This will override existing data. Continue?')) {
        return;
      }
    }
    onAddTable(columns, rows);
    onClose();
  };

  const handleRowsChange = (value) => {
    setRows(parseInt(value, 10));
  };

  return (
    <div className={styles.modal}>
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
            </div>
          ))}
          <Button variant="slim" onClick={handleAddColumn}>
            Add Column
          </Button>
        </div>
        <div className={styles.formGroup}>
          <label>Number of Rows:</label>
          <Input
            type="number"
            value={rows}
            onChange={handleRowsChange}
            min="1"
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
    </div>
  );
};

export default AddTableModal;
