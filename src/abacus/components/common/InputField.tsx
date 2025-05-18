import { cn } from '@/lib/utils/tailwind';
import { InputHTMLAttributes, forwardRef } from 'react';
import type { ClassNameValue } from 'tailwind-merge';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: ClassNameValue;
  labelClassName?: ClassNameValue;
  inputClassName?: ClassNameValue;
  errorClassName?: ClassNameValue;
  helperTextClassName?: ClassNameValue;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      helperTextClassName,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'text-sm font-medium text-gray-700',
              { 'text-gray-400': disabled },
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          disabled={disabled}
          required={required}
          className={cn(
            'rounded-full bg-primaryBlue/20 p-4',
            'text-sm text-gray-900 placeholder:text-gray-400',
            'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            { 'border-red-500 focus:border-red-500 focus:ring-red-500': error },
            inputClassName
          )}
          {...props}
        />

        {error && <p className={cn('text-sm text-red-500', errorClassName)}>{error}</p>}

        {helperText && !error && (
          <p className={cn('text-sm text-gray-500', helperTextClassName)}>{helperText}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
