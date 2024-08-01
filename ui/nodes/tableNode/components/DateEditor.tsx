import React, { useState, useRef, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { format, parse, isValid, getDaysInMonth } from 'date-fns';
import Dropdown from 'ui/dropdown/Dropdown';
import styles from '../styles/DateEditor.module.css';

export const DateEditor = (props: ICellEditorParams) => {
  const [date, setDate] = useState(() => {
    return props.value
      ? parse(props.value, 'yyyy-MM-dd', new Date())
      : new Date();
  });
  const [inputValue, setInputValue] = useState(props.value || '');
  const [showPopup, setShowPopup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateCellValue = (value: string) => {
    const updatedData = {
      ...props.node.data,
      [props.column.getColId()]: value
    };
    props.api.applyTransaction({ update: [updatedData] });
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    const formattedDate = format(newDate, 'yyyy-MM-dd');
    setInputValue(formattedDate);
    updateCellValue(formattedDate);
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

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() + i
  );
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const days = Array.from({ length: getDaysInMonth(date) }, (_, i) => i + 1);

  const handleYearChange = (selectedYear: string) => {
    handleDateChange(
      new Date(
        parseInt(selectedYear),
        date.getMonth(),
        Math.min(
          date.getDate(),
          getDaysInMonth(new Date(parseInt(selectedYear), date.getMonth()))
        )
      )
    );
  };

  const handleMonthChange = (selectedMonth: string) => {
    const monthIndex = months.indexOf(selectedMonth);
    handleDateChange(
      new Date(
        date.getFullYear(),
        monthIndex,
        Math.min(
          date.getDate(),
          getDaysInMonth(new Date(date.getFullYear(), monthIndex))
        )
      )
    );
  };

  const handleDayChange = (selectedDay: string) => {
    handleDateChange(
      new Date(date.getFullYear(), date.getMonth(), parseInt(selectedDay))
    );
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
      <button
        className={styles.calendarButton}
        onClick={() => setShowPopup(!showPopup)}
      >
        📅
      </button>
      {showPopup && (
        <div ref={popupRef} className={styles.popupContainer}>
          <Dropdown
            variant="datepicker"
            value={date.getFullYear().toString()}
            onChange={handleYearChange}
            className={styles.yearSelect}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            variant="datepicker"
            value={months[date.getMonth()]}
            onChange={handleMonthChange}
            className={styles.monthSelect}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            variant="datepicker"
            value={date.getDate().toString()}
            onChange={handleDayChange}
            className={styles.daySelect}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </Dropdown>
        </div>
      )}
    </div>
  );
};
