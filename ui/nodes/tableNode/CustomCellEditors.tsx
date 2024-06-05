import React from 'react';
import { ICellEditorParams } from 'ag-grid-community';

export const DateEditor = (props: ICellEditorParams) => {
  const [value, setValue] = React.useState(props.value || '');

  const handleDateChange = (e) => {
    setValue(e.target.value);
    props.stopEditing();
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <input
      type="date"
      value={value}
      onChange={handleDateChange}
      onBlur={() => props.stopEditing()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          props.stopEditing();
        }
      }}
    />
  );
};

export const DropdownEditor = (props: ICellEditorParams) => {
  const [value, setValue] = React.useState(props.value);
  const options = props.colDef.cellEditorParams?.options || [];

  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => props.stopEditing()}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const BooleanEditor = (props: ICellEditorParams) => {
  const [value, setValue] = React.useState(props.value);

  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => setValue(e.target.checked)}
      onBlur={() => props.stopEditing()}
    />
  );
};
