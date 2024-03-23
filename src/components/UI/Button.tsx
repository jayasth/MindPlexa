import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button
      className="px-4 py-2 bg-primary text-white rounded hover:bg-indigo-600"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
