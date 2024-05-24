import React, { useState } from 'react';
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

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Add Table</h2>
        <div className={styles.formGroup}>
          <label>Number of Rows:</label>
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value, 10))}
            min="1"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Columns:</label>
          {columns.map((col, index) => (
            <div key={index} className={styles.columnConfig}>
              <input
                type="text"
                placeholder="Column Name"
                value={col.name}
                onChange={(e) =>
                  handleColumnChange(index, 'name', e.target.value)
                }
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
          <button onClick={handleAddColumn}>Add Column</button>
        </div>
        <div className={styles.actions}>
          <button onClick={handleAddTable}>Add Table</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddTableModal;
