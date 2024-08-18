import React, { SelectHTMLAttributes, ChangeEvent } from 'react';
import cn from 'classnames';

import s from './Dropdown.module.css';

interface Props
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  className?: string;
  variant?: 'slim' | 'outline' | 'sleek' | 'gradient' | 'ghost';
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const Dropdown = (props: Props) => {
  const {
    className,
    variant = 'sleek',
    onChange,
    children,
    style,
    ...rest
  } = props;

  const rootClassName = cn(
    s.root,
    {
      [s.slim]: variant === 'slim',
      [s.outline]: variant === 'outline',
      [s.sleek]: variant === 'sleek',
      [s.gradient]: variant === 'gradient',
      [s.ghost]: variant === 'ghost'
    },
    className
  );

  const handleOnChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
    return null;
  };

  return (
    <select
      className={rootClassName}
      onChange={handleOnChange}
      style={style}
      {...rest}
    >
      {children}
    </select>
  );
};

export default Dropdown;
