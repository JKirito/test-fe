import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import './InputField.scss';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  containerClassName?: string; // Optional class for the root container
  labelClassName?: string; // Optional class for the label
  inputClassName?: string; // Optional class for the input element itself
  error?: boolean | string | undefined; // Revert type
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  icon,
  id,
  type = 'text',
  placeholder,
  containerClassName,
  labelClassName,
  inputClassName,
  error,
  ...rest // Pass remaining props like name, autoComplete etc. to the input
}) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={clsx('inputField', containerClassName, { 'e-error': !!error })}>
      <label htmlFor={inputId} className={clsx('inputField__label', labelClassName)}>
        {label}
      </label>
      <div
        className={clsx('inputField__wrapper', {
          'inputField__wrapper--with-icon': !!icon,
        })}
      >
        {icon && <span className="inputField__icon">{icon}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={clsx('inputField__input', inputClassName)}
          aria-invalid={!!error} // Add aria-invalid for accessibility
          {...rest}
        />
      </div>
      {typeof error === 'string' && error.length > 0 && (
        <span className="inputField__errorMessage">{error}</span>
      )}
    </div>
  );
};

export default InputField;
