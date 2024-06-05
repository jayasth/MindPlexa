import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from './AddTableModal.module.css';

interface Column {
  name: string;
  type: string;
  defaultValue: string;
  cellEditorParams?: { options: string[] };
}

const AddTableModal = ({ onClose, onAddTable, hasExistingData }) => {
  const [columns, setColumns] = useState<Column[]>([
    { name: '', type: 'text', defaultValue: '' }
  ]);
  const [rows, setRows] = useState(1);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const validTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'currency', label: 'Currency' },
    { value: 'dropdown', label: 'Dropdown' }
  ];

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'text', defaultValue: '' }]);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    if (field === 'type' && !validTypes.some((type) => type.value === value)) {
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
      const formattedColumns = columns.map((col) => {
        if (col.type === 'dropdown') {
          col.cellEditorParams = { options: col.defaultValue.split(',') };
        }
        return col;
      });
      onAddTable(formattedColumns, rows);
      onClose();
    }
  };

  const handleConfirmAddTable = () => {
    const formattedColumns = columns.map((col) => {
      if (col.type === 'dropdown') {
        col.cellEditorParams = { options: col.defaultValue.split(',') };
      }
      return col;
    });
    onAddTable(formattedColumns, rows);
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
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Dropdown>
              <Input
                type="text"
                placeholder={
                  col.type === 'dropdown'
                    ? 'Options (comma separated)'
                    : 'Default Value'
                }
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
            type="number"
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
