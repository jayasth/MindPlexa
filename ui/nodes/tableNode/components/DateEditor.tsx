import React, { useState, useRef, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { format, parse, isValid } from 'date-fns';
import styles from '../styles/DateEditor.module.css';

export const DateEditor = (props: ICellEditorParams) => {
  const [date, setDate] = useState(() => {
    return props.value
      ? parse(props.value, 'YYYY-MM-DD', new Date())
      : new Date();
  });
  const [inputValue, setInputValue] = useState(props.value || '');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const updateCellValue = (value: string) => {
    const formattedDate = format(
      parse(value, dateFormat, new Date()),
      'YYYY-MM-DD'
    );
    props.node.setDataValue(props.column.getColId(), formattedDate);
    props.api.stopEditing();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const parsedDate = parse(value, dateFormat, new Date());
    if (isValid(parsedDate)) {
      setDate(parsedDate);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsedDate = parse(inputValue, dateFormat, new Date());
      if (isValid(parsedDate)) {
        updateCellValue(format(parsedDate, 'YYYY-MM-DD'));
      }
    }
  };

  const handleBlur = () => {
    const parsedDate = parse(inputValue, dateFormat, new Date());
    if (isValid(parsedDate)) {
      updateCellValue(format(parsedDate, 'YYYY-MM-DD'));
    } else {
      // If the date is invalid, revert to the original value
      setInputValue(props.value || '');
    }
  };

  return (
    <div className={styles.dateEditorContainer}>
      <input
        ref={inputRef}
        type="date"
        value={inputValue}
        onChange={handleDateChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={styles.dateInput}
      />
    </div>
  );
};
