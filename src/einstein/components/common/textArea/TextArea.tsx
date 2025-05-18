import React, { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import './TextArea.scss';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  containerClassName?: string; // Optional class for the root container
  labelClassName?: string; // Optional class for the label
  textAreaClassName?: string; // Optional class for the textarea element itself
  error?: boolean | string | undefined; // Revert type
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  id,
  placeholder,
  rows = 4, // Default rows
  containerClassName,
  labelClassName,
  textAreaClassName,
  error,
  ...rest // Pass remaining props like name etc. to the textarea
}) => {
  const textAreaId = id || `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={clsx('textArea', containerClassName, { 'e-error': !!error })}>
      <label htmlFor={textAreaId} className={clsx('textArea__label', labelClassName)}>
        {label}
      </label>
      <textarea
        id={textAreaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={clsx('textArea__input', textAreaClassName)}
        aria-invalid={!!error}
        {...rest}
      />
      {typeof error === 'string' && error.length > 0 && (
        <span className="textArea__errorMessage">{error}</span>
      )}
    </div>
  );
};

export default TextArea;
