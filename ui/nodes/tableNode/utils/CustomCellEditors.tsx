import React, { useState, useRef, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

export const DateEditor = (props: ICellEditorParams) => {
  const [date, setDate] = useState(() => {
    return props.value ? parse(props.value, 'yyyy-MM-dd', new Date()) : null;
  });
  const datePickerRef = useRef<DatePicker>(null);

  useEffect(() => {
    // Open the date picker when the component mounts
    if (datePickerRef.current) {
      datePickerRef.current.setOpen(true);
    }
  }, []);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    if (newDate) {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      props.api.stopEditing();
      props.api.applyTransaction({
        update: [
          { ...props.node.data, [props.column.getColId()]: formattedDate }
        ]
      });
    }
  };

  return (
    <DatePicker
      ref={datePickerRef}
      selected={date}
      onChange={handleDateChange}
      dateFormat="yyyy-MM-dd"
      isClearable
      placeholderText="Select a date"
      onClickOutside={() => props.api.stopEditing()}
      popperPlacement="bottom-start"
      popperModifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8]
          },
          fn: ({ x, y, placement, rects }) => ({
            x,
            y: y + 8
          })
        },
        {
          name: 'preventOverflow',
          options: {
            rootBoundary: 'viewport',
            tether: false,
            altAxis: true
          },
          fn: ({ x, y, placement, rects, elements }) => ({
            x,
            y
          })
        }
      ]}
    />
  );
};
