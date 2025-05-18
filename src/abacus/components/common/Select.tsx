import { ChevronDown } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const Select = ({
  value,
  onValueChange,
  options,
  label,
  className,
  labelClassName,
  selectClassName,
  containerClassName,
  size = 'md',
  disabled = false,
}: SelectProps) => {
  // Track open/closed state of the dropdown
  const [isOpen, setIsOpen] = useState(false);

  // Size-based padding classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  // Size-based icon sizes
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  // Find the selected option's label
  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : '';

  // Reference to the native select element
  const selectRef = useRef<HTMLSelectElement>(null);
  // Reference to the select container
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle the onChange event explicitly
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // console.log(`Select changed: ${newValue}`);

    // Check if option is disabled
    const option = options.find((opt) => opt.value === newValue);
    if (option?.disabled) {
      // console.log('Attempted to select disabled option');
      return;
    }

    // Call the provided callback with the new value
    onValueChange(newValue);
    setIsOpen(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default to avoid native select dropdown
    if (disabled) return; // Don't toggle if the select is disabled
    setIsOpen(!isOpen);
  };

  // Handle manual option selection from the visible dropdown
  const handleOptionClick = (optionValue: string, isDisabled: boolean) => {
    // Don't do anything if the option is disabled
    if (isDisabled) {
      // console.log('Attempted to select disabled option');
      return;
    }

    // Set the native select value
    if (selectRef.current) {
      selectRef.current.value = optionValue;
    }

    // Call the provided callback with the new value
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={`flex flex-col ${containerClassName || ''} ${className || ''}`}
      ref={containerRef}
    >
      {label && (
        <label className={`text-sm font-medium text-gray-700 mb-1 ${labelClassName || ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {/* Hidden native select for form submission and accessibility */}
        <select
          ref={selectRef}
          value={value}
          onChange={handleChange}
          className="sr-only" // Screen-reader only, completely hidden
          aria-hidden="false" // Still available to screen readers
          tabIndex={-1} // Remove from tab order
          disabled={disabled}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="font-poppins"
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom select appearance */}
        <div
          className={`${
            sizeClasses[size]
          } border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full flex items-center justify-between ${
            selectClassName || ''
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
          onClick={toggleDropdown}
          tabIndex={disabled ? -1 : 0} // Make focusable unless disabled
          onKeyDown={(e) => {
            // Allow opening with Enter or Space if not disabled
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
        >
          <span className="truncate font-poppins">{selectedLabel}</span>
          <ChevronDown
            size={iconSizes[size]}
            className={`ml-2 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Custom dropdown options */}
        {isOpen && !disabled && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 hover:bg-gray-100 ${
                  option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : ''
                } ${
                  option.disabled
                    ? 'opacity-50 cursor-not-allowed text-gray-400 bg-gray-50'
                    : 'cursor-pointer'
                } ${option.className || ''}`}
                onClick={() => handleOptionClick(option.value, !!option.disabled)}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                style={option.style || {}}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;
