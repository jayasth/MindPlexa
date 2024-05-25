import React, { useState } from 'react';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import styles from './AddTableModal.module.css';

const AddTableModal = ({ onClose, onAddTable }) => {
  const [columns, setColumns] = useState([{ name: '', type: 'text' }]);
  const [rows, setRows] = useState(1);

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'text' }]);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleAddTable = () => {
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
              />
              <select
                value={col.type}
                onChange={(e) =>
                  handleColumnChange(index, 'type', e.target.value)
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
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
          />
        </div>
        <div className={styles.actions}>
          <Button variant="rounded" onClick={handleAddTable}>
            Add Table
          </Button>
          <Button variant="rounded" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTableModal;
