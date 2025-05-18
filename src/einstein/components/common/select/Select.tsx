import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import './Select.scss';

// Export the SelectOption interface to be used externally
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean; // Add optional disabled property
}

interface SelectProps {
  label: string;
  options: SelectOption[]; // Use the updated interface
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean | string | undefined;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (selectedValue: string, isDisabled?: boolean) => {
    if (isDisabled) return; // Do nothing if the option is disabled
    onChange(selectedValue);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the selected option's label
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={clsx('select', { 'e-error': !!error })}>
      <label className="select__label">{label}</label>
      <div className="select__dropdownWrapper" ref={dropdownRef}>
        <div
          className="select__dropdownTrigger"
          onClick={() => setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={!!error}
        >
          <span className="select__dropdownSummary">{displayText}</span>
          <ChevronDown className="select__dropdownIcon" />
        </div>
        {isOpen && (
          <div className="select__dropdownContent" role="listbox">
            {options.map((option) => (
              <div
                key={option.value}
                className={clsx('select__option', {
                  'select__option--selected': value === option.value,
                  'select__option--disabled': !!option.disabled, // Add disabled class
                })}
                // Pass disabled status to handler
                onClick={() => handleSelect(option.value, option.disabled)}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={!!option.disabled} // Add aria-disabled for accessibility
              >
                <span className="select__optionLabel">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {typeof error === 'string' && error.length > 0 && (
        <span className="select__errorMessage">{error}</span>
      )}
    </div>
  );
};

export default Select;
