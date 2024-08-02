import React, { useState, useRef, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { format, parse, isValid } from 'date-fns';
import styles from '../styles/DateEditor.module.css';
import { enUS, fr, enGB, de, es, it, ja, ko, ru, zhCN } from 'date-fns/locale';

const locales = { enUS, fr, enGB, de, es, it, ja, ko, ru, zhCN };

export const DateEditor = (props: ICellEditorParams) => {
  const [date, setDate] = useState(() => {
    return props.value
      ? parse(props.value, 'yyyy-MM-dd', new Date())
      : new Date();
  });
  const [inputValue, setInputValue] = useState(props.value || '');
  const [dateFormat, setDateFormat] = useState('yyyy-MM-dd');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const updateCellValue = (value: string) => {
    const formattedDate = format(
      parse(value, dateFormat, new Date()),
      'yyyy-MM-dd'
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
        updateCellValue(format(parsedDate, 'yyyy-MM-dd'));
      }
    }
  };

  const handleBlur = () => {
    const parsedDate = parse(inputValue, dateFormat, new Date());
    if (isValid(parsedDate)) {
      updateCellValue(format(parsedDate, 'yyyy-MM-dd'));
    } else {
      // If the date is invalid, revert to the original value
      setInputValue(props.value || '');
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFormat(e.target.value);
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
      <select
        value={dateFormat}
        onChange={handleFormatChange}
        className={styles.formatSelect}
      >
        <option value="yyyy-MM-dd">YYYY-MM-DD</option>
        <option value="dd/MM/yyyy">DD/MM/YYYY</option>
        <option value="MM/dd/yyyy">MM/DD/YYYY</option>
      </select>
    </div>
  );
};
