import React, { useState } from 'react';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from './CustomHeader.module.css';

interface CustomHeaderProps {
  column: any;
  displayName: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ column, displayName }) => {
  const [headerName, setHeaderName] = useState(displayName);
  const [columnType, setColumnType] = useState(column.colDef.type);

  const handleHeaderNameChange = (value: string) => {
    setHeaderName(value);
    column.colDef.headerName = value; // Update the header name in the column definition
  };

  const handleColumnTypeChange = (value: string) => {
    setColumnType(value);
    column.colDef.type = value; // Update the column type in the column definition
  };

  return (
    <div className={styles.headerContainer}>
      <Input
        value={headerName}
        onChange={handleHeaderNameChange}
        className={styles.headerInput}
      />
      <Dropdown
        value={columnType}
        onChange={handleColumnTypeChange}
        variant="slim"
        className={styles.typeDropdown}
      >
        <option value="text">Aa</option>
        <option value="number">123</option>
        <option value="date">📅</option>
        <option value="boolean">✓/✗</option>
        <option value="currency">$</option>
        <option value="dropdown">▾</option>
      </Dropdown>
    </div>
  );
};

export default CustomHeader;
