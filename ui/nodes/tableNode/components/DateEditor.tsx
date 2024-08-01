import React, { useState, useRef, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import DatePicker from 'react-datepicker';
import { format, parse, isValid } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/DateEditor.module.css';

export const DateEditor = (props: ICellEditorParams) => {
  const [date, setDate] = useState(() => {
    return props.value ? parse(props.value, 'yyyy-MM-dd', new Date()) : null;
  });
  const [inputValue, setInputValue] = useState(props.value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const updateCellValue = (value: string) => {
    const updatedData = {
      ...props.node.data,
      [props.column.getColId()]: value
    };
    props.api.applyTransaction({ update: [updatedData] });
  };

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    if (newDate) {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      setInputValue(formattedDate);
      updateCellValue(formattedDate);
      props.api.stopEditing();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      setDate(parsedDate);
      updateCellValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsedDate = parse(inputValue, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        props.api.stopEditing();
      }
    }
  };

  return (
    <div className={styles.dateEditorContainer}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={styles.dateInput}
        placeholder="YYYY-MM-DD"
      />
      <DatePicker
        selected={date}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        customInput={<div className={styles.calendarIcon}>📅</div>}
        popperPlacement="bottom-start"
      />
    </div>
  );
};
