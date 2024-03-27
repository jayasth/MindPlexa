// src/components/Common/Icon.tsx
import React from "react";

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
  return <i className={`icon icon-${name} ${className}`} />;
};

export default Icon;
