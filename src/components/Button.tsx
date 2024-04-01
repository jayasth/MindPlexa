import React from "react";

const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => <button onClick={onClick}>{children}</button>;

export default Button;
