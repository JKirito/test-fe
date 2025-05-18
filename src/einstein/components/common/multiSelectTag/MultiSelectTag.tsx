import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import Tag from '../tag/Tag';
import { ChevronDown, Check } from 'lucide-react';
// Import standard SCSS file for side effects
import './MultiSelectTag.scss';

interface MultiSelectTagProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  prefix?: boolean;
}

const MultiSelectTag: React.FC<MultiSelectTagProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  prefix,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value));
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

  const prefixText = prefix ? `${label}` : `Select ${label}`;

  // Generate summary text for selected options
  const summaryText =
    selectedValues.length > 0 ? `${selectedValues.length} selected` : `${prefixText}`;

  return (
    // Use BEM class name directly
    <div className="multiSelectTag">
      <label className="multiSelectTag__label">{label}</label>
      <div className="multiSelectTag__dropdownWrapper" ref={dropdownRef}>
        <div className="multiSelectTag__dropdownTrigger" onClick={() => setIsOpen(!isOpen)}>
          <span className="multiSelectTag__dropdownSummary">{summaryText}</span>
          <ChevronDown className="multiSelectTag__dropdownIcon" />
        </div>
        {isOpen && (
          <div className="multiSelectTag__dropdownContent">
            {options.map((option) => (
              <div
                key={option.value}
                className={clsx('multiSelectTag__option', {
                  'multiSelectTag__option--selected': selectedValues.includes(option.value),
                })}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={selectedValues.includes(option.value)}
              >
                <div className="multiSelectTag__optionCheckbox">
                  {selectedValues.includes(option.value) && (
                    <Check size={14} className="multiSelectTag__optionCheckmark" />
                  )}
                </div>
                <span className="multiSelectTag__optionLabel">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Tags container - Use BEM class name directly */}
      <div className="multiSelectTag__tagsContainer">
        {selectedValues.map((value) => {
          const option = options.find((opt) => opt.value === value);
          return option ? (
            <Tag key={value} label={option.label} onRemove={() => handleRemove(value)} />
          ) : null;
        })}
      </div>
    </div>
  );
};

export default MultiSelectTag;
