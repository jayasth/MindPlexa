import React, { useState, useEffect } from 'react';

export const TextEditor = ({ row, column, onRowChange, onClose }) => {
  const [value, setValue] = useState(row[column.key]);

  useEffect(() => {
    const listener = (event) => {
      if (event.key === 'Enter') {
        onRowChange({ ...row, [column.key]: value });
        onClose();
      }
    };

    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [onRowChange, onClose, row, column.key, value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

export const BooleanEditor = ({ row, column, onRowChange, onClose }) => {
  const [value, setValue] = useState(row[column.key]);

  useEffect(() => {
    const listener = (event) => {
      if (event.key === 'Enter') {
        onRowChange({ ...row, [column.key]: value });
        onClose();
      }
    };

    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [onRowChange, onClose, row, column.key, value]);

  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(event) => setValue(event.target.checked)}
    />
  );
};
