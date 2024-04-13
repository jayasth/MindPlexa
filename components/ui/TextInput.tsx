// TextInput component
import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type here..."
      className="w-full px-4 py-2 border border-gray-300 rounded"
    />
  );
};

export default TextInput;
