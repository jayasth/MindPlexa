import React, { useState } from 'react';
import { IFloatingFilterParams } from 'ag-grid-community';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { IoFilter } from 'react-icons/io5';
import Dropdown from '@/ui/dropdown/Dropdown';
import Input from '@/ui/Input/Input';
import Button from '@/ui/Button/Button';
import styles from '@/ui/nodes/tableNode/styles/CustomFloatingFilter.module.css';

const CustomFloatingFilter: React.FC<IFloatingFilterParams> = (props) => {
  const [filterValue, setFilterValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('contains');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    props.parentFilterInstance((instance) => {
      instance.onFloatingFilterChanged(dropdownValue, value);
    });
  };

  const handleDropdownChange = (value: string) => {
    setDropdownValue(value);
    props.parentFilterInstance((instance) => {
      instance.onFloatingFilterChanged(value, filterValue);
    });
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.customFloatingFilter}>
      <Input
        value={filterValue}
        onChange={handleFilterChange}
        placeholder="Filter..."
        className={styles.input}
      />
      <button
        onClick={handleModalOpen}
        className={styles.filterButton}
        title="Advanced Filter"
      >
        <IoFilter />
      </button>
      <Modal open={isModalOpen} onClose={handleModalClose} center>
        <div className={styles.modalContent}>
          <h2 className={styles.modalHeader}>Advanced Filter</h2>
          <div className={styles.formGroup}>
            <label className={styles.label}>Condition:</label>
            <Dropdown
              value={dropdownValue}
              onChange={handleDropdownChange}
              className={styles.dropdown}
            >
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
              <option value="startsWith">Starts With</option>
              <option value="endsWith">Ends With</option>
            </Dropdown>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Filter Value:</label>
            <Input
              value={filterValue}
              onChange={handleFilterChange}
              placeholder="Enter value"
              className={styles.input}
            />
          </div>
          <div className={styles.actions}>
            <Button variant="submit" onClick={handleModalClose}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomFloatingFilter;
