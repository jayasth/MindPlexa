import React, { InputHTMLAttributes, ChangeEvent } from 'react';
import cn from 'classnames';

import s from './Input.module.css';

interface Props extends Omit<InputHTMLAttributes<any>, 'onChange'> {
  className?: string;
  variant?: 'slim' | 'outline' | 'sleek' | 'gradient' | 'ghost';
  onChange: (value: string) => void;
}
const Input = (props: Props) => {
  const { className, variant = 'sleek', onChange, ...rest } = props;

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

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
    return null;
  };

  return (
    <label>
      <input
        className={rootClassName}
        onChange={handleOnChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        {...rest}
      />
    </label>
  );
};

export default Input;
