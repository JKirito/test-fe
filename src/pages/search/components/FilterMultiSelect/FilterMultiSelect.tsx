import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import Tag from '@/einstein/components/common/tag/Tag'; // Adjusted path assuming Tag is common
import { ChevronDown, Check, Minus } from 'lucide-react';
import styles from './FilterMultiSelect.module.scss'; // Use new SCSS module

interface FilterMultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  selectAllLabel?: string;
}

const FilterMultiSelect: React.FC<FilterMultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  selectAllLabel = 'Select All',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allOptionValues = options.map((opt) => opt.value);
  const areAllSelected = options.length > 0 && selectedValues.length === options.length;
  const areSomeSelected = selectedValues.length > 0 && !areAllSelected;

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (areAllSelected) {
      onChange([]); // Deselect all
    } else {
      onChange(allOptionValues); // Select all
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

  // Generate summary text for selected options
  const summaryText =
    selectedValues.length > 0 ? `${selectedValues.length} selected` : `Select ${label}`; // Simplified summary

  return (
    // Use BEM-like class names specific to this component
    <div className={styles.filterMultiSelect}>
      <label className={styles.filterMultiSelectLabel}>{label}</label>
      <div className={styles.filterMultiSelectDropdownWrapper} ref={dropdownRef}>
        <div className={styles.filterMultiSelectDropdownTrigger} onClick={() => setIsOpen(!isOpen)}>
          <span className={styles.filterMultiSelectDropdownSummary}>{summaryText}</span>
          <ChevronDown className={styles.filterMultiSelectDropdownIcon} />
        </div>
        {isOpen && (
          <div className={styles.filterMultiSelectDropdownContent}>
            {/* Select All Option */}
            <div
              className={clsx(
                styles.filterMultiSelectOption,
                styles.filterMultiSelectOptionSelectAll
              )}
              onClick={handleSelectAll}
              role="option"
              aria-selected={areAllSelected ? 'true' : 'false'}
            >
              <div className={styles.filterMultiSelectOptionCheckbox}>
                {areAllSelected ? (
                  <Check size={14} className={styles.filterMultiSelectOptionCheckmark} />
                ) : areSomeSelected ? (
                  <Minus
                    size={14}
                    className={clsx(
                      styles.filterMultiSelectOptionCheckmark,
                      styles.filterMultiSelectOptionCheckmarkIndeterminate
                    )}
                  />
                ) : null}
              </div>
              <span className={styles.filterMultiSelectOptionLabel}>{selectAllLabel}</span>
            </div>
            {/* Separator */}
            <hr className={styles.filterMultiSelectSeparator} />
            {/* Individual Options */}
            {options.map((option) => (
              <div
                key={option.value}
                className={clsx(styles.filterMultiSelectOption, {
                  [styles.filterMultiSelectOptionSelected]: selectedValues.includes(option.value),
                })}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={selectedValues.includes(option.value)}
              >
                <div className={styles.filterMultiSelectOptionCheckbox}>
                  {selectedValues.includes(option.value) && (
                    <Check size={14} className={styles.filterMultiSelectOptionCheckmark} />
                  )}
                </div>
                <span className={styles.filterMultiSelectOptionLabel}>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Tags container - Conditionally render ALL tag or individual tags */}
      <div className={styles.filterMultiSelectTagsContainer}>
        {areAllSelected ? (
          <Tag
            key="all-tag"
            label="ALL" // Use a clear label for the "all selected" state
            onRemove={() => onChange([])} // Clicking remove on "ALL" deselects everything
          />
        ) : (
          selectedValues.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return option ? (
              <Tag key={value} label={option.label} onRemove={() => handleRemove(value)} />
            ) : null;
          })
        )}
      </div>
    </div>
  );
};

export default FilterMultiSelect;
