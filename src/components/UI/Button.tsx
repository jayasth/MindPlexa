import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button
      className="px-4 py-2 btn-secondary text-white rounded hover:bg-btn-secondary-hover transition-colors duration-300"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
