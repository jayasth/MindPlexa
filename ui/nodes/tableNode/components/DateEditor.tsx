import React, { useState, useRef, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { format, parse, isValid } from 'date-fns';
import styles from '../styles/DateEditor.module.css';

export const DateEditor = (props: ICellEditorParams) => {
  const [date, setDate] = useState(() => {
    return props.value
      ? parse(props.value, 'yyyy-MM-dd', new Date())
      : new Date();
  });
  const [inputValue, setInputValue] = useState(props.value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const updateCellValue = (value: string) => {
    const formattedDate = format(
      parse(value, 'yyyy-MM-dd', new Date()),
      'yyyy-MM-dd'
    );
    props.api.stopEditing();
    props.api.applyTransaction({
      update: [{ ...props.node.data, [props.column.getColId()]: formattedDate }]
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      setDate(parsedDate);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsedDate = parse(inputValue, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        updateCellValue(format(parsedDate, 'yyyy-MM-dd'));
      }
    }
  };

  const handleBlur = () => {
    const parsedDate = parse(inputValue, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      updateCellValue(format(parsedDate, 'yyyy-MM-dd'));
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
