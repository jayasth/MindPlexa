import React, { InputHTMLAttributes, ChangeEvent } from 'react';
import cn from 'classnames';

import s from './Input.module.css';

interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    'onChange'
  > {
  className?: string;
  variant?: 'slim' | 'outline' | 'sleek' | 'gradient' | 'ghost';
  onChange: (value: string) => void;
  label?: string;
  type?: string;
  rows?: number;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

const Input = (props: Props) => {
  const {
    className,
    variant = 'sleek',
    onChange,
    label,
    id,
    type = 'text',
    rows,
    onKeyPress,
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

  const handleOnChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) {
      onChange(e.target.value);
    }
    return null;
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="mb-1 text-sm font-medium">
          {label}
        </label>
      )}
      <InputComponent
        className={rootClassName}
        onChange={handleOnChange}
        id={id}
        type={type !== 'textarea' ? type : undefined}
        rows={type === 'textarea' ? rows : undefined}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onKeyPress={onKeyPress}
        {...rest}
      />
    </div>
  );
};

export default Input;
