import { useState, useEffect } from 'react';
import React from 'react';
import './HowToDropdown.scss';
import CustomSelect from '../../../common/select/CustomSelect';
interface HowToDropdownProps {
  text: string;
  options: { value: string; label: string; original?: any; disabled?: boolean }[];
  onChange?: (value: string) => void;
  selectedValue?: string;
  disabled?: boolean;
}

const HowToDropdown = ({
  text,
  options,
  onChange,
  selectedValue: externalSelectedValue,
  disabled = false,
}: HowToDropdownProps) => {
  // Initialize with empty string instead of defaulting to first option
  const [selectedValue, setSelectedValue] = useState(externalSelectedValue || '');

  // Update internal state when external value changes
  useEffect(() => {
    if (externalSelectedValue !== undefined) {
      setSelectedValue(externalSelectedValue);
    }
  }, [externalSelectedValue]);

  const handleValueChange = (value: string) => {
    // Check if the selected option is disabled
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption?.disabled) {
      // Don't allow selection of disabled options
      // // console.log(`Attempted to select disabled option: ${value}`);
      return;
    }

    // Update local state
    setSelectedValue(value);

    // Call the onChange handler with the new value
    if (onChange) {
      onChange(value);
    }

    // Add debug logging - can be removed after fixing
    // // console.log(`${text} dropdown changed to:`, value);
  };

  // Add placeholder option to the options list
  const optionsWithPlaceholder = [{ value: '', label: 'Select option' }, ...options];

  // Process options to add CSS classes and styling for disabled options
  const processedOptions = optionsWithPlaceholder.map((option) => ({
    ...option,
    // Add custom styling directly to ensure it's applied
    style: option.disabled
      ? ({
          opacity: 0.5,
          color: '#999',
          backgroundColor: '#f0f0f0',
          cursor: 'not-allowed',
          fontStyle: 'italic',
        } as React.CSSProperties)
      : undefined,
    className: option.disabled ? 'disabled-option' : '',
  }));

  return (
    <div className={`how-to-dropdown ${disabled ? 'opacity-50' : ''}`}>
      <p className="how-to-dropdown-title">{text}</p>
      <CustomSelect
        value={selectedValue}
        onValueChange={handleValueChange}
        size="lg"
        options={processedOptions}
        disabled={disabled}
      />

      {/* Add styling for disabled options using CSS */}
      <style>{`
        .disabled-option {
          opacity: 0.5 !important;
          color: #999 !important;
          background-color: #f0f0f0 !important;
          cursor: not-allowed !important;
          font-style: italic !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
};

export default HowToDropdown;
