import { ChevronDown } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import './CustomSelect.scss';

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

  // Find the selected option's label
  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : '';

  // References
  const selectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown to close it
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

  // Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // console.log(`Select changed: ${newValue}`);

    // Check if option is disabled
    const option = options.find((opt) => opt.value === newValue);
    if (option?.disabled) {
      // console.log('Attempted to select disabled option');
      return;
    }

    onValueChange(newValue);
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue: string, isDisabled: boolean) => {
    if (isDisabled) {
      // console.log('Attempted to select disabled option');
      return;
    }

    if (selectRef.current) {
      selectRef.current.value = optionValue;
    }

    onValueChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`custom-select__container ${containerClassName || ''} ${className || ''}`}
      ref={containerRef}
    >
      {label && <label className={`custom-select__label ${labelClassName || ''}`}>{label}</label>}
      <div className="custom-select__wrapper">
        {/* Hidden native select for form submission and accessibility */}
        <select
          ref={selectRef}
          value={value}
          onChange={handleChange}
          className="sr-only"
          aria-hidden="false"
          tabIndex={-1}
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
          className={`custom-select__control custom-select__control--size-${size} ${
            disabled ? 'custom-select__control--disabled' : ''
          } ${selectClassName || ''}`}
          onClick={toggleDropdown}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
        >
          <span className="custom-select__value">{selectedLabel}</span>
          <ChevronDown
            className={`custom-select__icon custom-select__icon--size-${size} ${
              isOpen ? 'custom-select__icon--open' : ''
            }`}
          />
        </div>

        {/* Custom dropdown options */}
        {isOpen && !disabled && (
          <div className="custom-select__dropdown" role="listbox">
            {options.map((option) => (
              <div
                key={option.value}
                className={`custom-select__option ${
                  option.value === value ? 'custom-select__option--selected' : ''
                } ${
                  option.disabled ? 'custom-select__option--disabled' : ''
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
