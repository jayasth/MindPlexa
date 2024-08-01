import React, { SelectHTMLAttributes, ChangeEvent } from 'react';
import cn from 'classnames';

import s from './Dropdown.module.css';

interface Props extends Omit<SelectHTMLAttributes<any>, 'onChange'> {
  className?: string;
  variant?: 'slim' | 'outline' | 'sleek' | 'gradient' | 'datepicker';
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
      [s.datepicker]: variant === 'datepicker'
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
    <label className={s.label}>
      <select
        className={rootClassName}
        onChange={handleOnChange}
        style={style}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
};

export default Dropdown;
