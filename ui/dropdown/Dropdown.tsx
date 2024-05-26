import React, { SelectHTMLAttributes, ChangeEvent } from 'react';
import cn from 'classnames';

import s from './Dropdown.module.css';

interface Props extends Omit<SelectHTMLAttributes<any>, 'onChange'> {
  className?: string;
  variant?: 'slim' | 'outline' | 'sleek' | 'gradient';
  onChange: (value: string) => void;
}

const Dropdown = (props: Props) => {
  const { className, variant = 'sleek', onChange, children, ...rest } = props;

  const rootClassName = cn(
    s.root,
    {
      [s.slim]: variant === 'slim',
      [s.outline]: variant === 'outline',
      [s.sleek]: variant === 'sleek',
      [s.gradient]: variant === 'gradient'
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
    <label>
      <select className={rootClassName} onChange={handleOnChange} {...rest}>
        {children}
      </select>
    </label>
  );
};

export default Dropdown;
