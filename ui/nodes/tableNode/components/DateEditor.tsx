import React, { useState, useRef, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { parse, format, isValid } from 'date-fns';
import styles from '@/ui/nodes/tableNode/styles/DateEditor.module.css';

interface DateEditorProps extends ICellEditorParams {
  dateFormat: string;
}

export const DateEditor: React.FC<DateEditorProps> = (props) => {
  const [inputValue, setInputValue] = useState(props.value || '');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const dateFormat = props.dateFormat || 'yyyy-MM-dd';

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const parseDate = (value: string): Date | null => {
    const possibleFormats = [
      'yyyy-MM-dd',
      'dd/MM/yyyy',
      'MM/dd/yyyy',
      'dd.MM.yyyy',
      'yyyy/MM/dd'
    ];
    for (const fmt of possibleFormats) {
      const parsedDate = parse(value, fmt, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-insert separators
    if (value.length === 4 || value.length === 7) {
      setInputValue(value + '-');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsedDate = parseDate(inputValue);
      if (parsedDate) {
        const formattedDate = format(parsedDate, dateFormat);
        props.stopEditing();
        props.api.setFocusedCell(props.rowIndex + 1, props.column);
      } else {
        setInputValue('');
        // Show warning toast here
      }
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    if (isValid(selectedDate)) {
      const formattedDate = format(selectedDate, dateFormat);
      setInputValue(formattedDate);
      props.stopEditing();
      props.api.setFocusedCell(props.rowIndex + 1, props.column);
    }
  };

  const toggleDatePicker = () => {
    setIsPickerVisible(!isPickerVisible);
    if (!isPickerVisible && datePickerRef.current) {
      datePickerRef.current.showPicker();
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
        placeholder={dateFormat.toLowerCase()}
      />
      <button onClick={toggleDatePicker} className={styles.calendarButton}>
        📅
      </button>
      <input
        ref={datePickerRef}
        type="date"
        onChange={handleDatePickerChange}
        className={styles.datePicker}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DateEditor;
