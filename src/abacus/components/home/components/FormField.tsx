import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/tailwind';
import debounce from 'lodash/debounce';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'select' | 'search' | 'textarea';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  onSearch?: (query: string) => Promise<string[]>;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  error?: string;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  options = [],
  required = false,
  placeholder = '',
  onSearch,
  onSelect,
  disabled = false,
  containerClassName,
  labelClassName,
  inputClassName,
  error,
  rows = 4,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (onSearch && query.trim()) {
        const results = await onSearch(query);
        setSearchResults(results);
        setIsOpen(true);
      } else {
        setSearchResults([]);
        setIsOpen(false);
      }
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    if (type === 'search') {
      debouncedSearch(searchTerm);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, type, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (selectedValue: string) => {
    onChange(selectedValue);
    onSelect?.(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (type === 'search') {
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)} ref={searchRef}>
        {label && (
          <label
            htmlFor={name}
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
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!e.target.value) {
                setIsOpen(false);
              }
            }}
            onFocus={() => {
              if (searchTerm) {
                setIsOpen(true);
              }
            }}
            placeholder={value || placeholder}
            className={cn(
              'w-full p-4 pr-10 pl-6 appearance-none',
              'rounded-full bg-primaryBlue/20',
              'focus:outline-none focus:ring-2 focus:ring-primaryBlue/50',
              'text-titlePrimaryBlue font-poppins text-center',
              { 'opacity-60 cursor-not-allowed': disabled },
              { 'border-red-500 focus:ring-red-500': error },
              inputClassName
            )}
          />
          {isOpen && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
              {searchResults.map((result) => (
                <div
                  key={result}
                  onClick={() => handleSearchSelect(result)}
                  className="px-4 py-2 hover:bg-primaryBlue/20 cursor-pointer text-titlePrimaryBlue"
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={name}
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
        <div className="relative">
          <select
            ref={selectRef}
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            className={cn(
              'w-full p-4 pr-10 pl-6 appearance-none',
              'rounded-full bg-primaryBlue/20',
              'focus:outline-none focus:ring-2 focus:ring-primaryBlue/50',
              'text-titlePrimaryBlue font-poppins text-center',
              'cursor-pointer',
              '[&>option]:bg-white [&>option]:text-titlePrimaryBlue',
              '[&>option]:font-poppins',
              '[&_option]:border-none',
              { 'opacity-60 cursor-not-allowed': disabled },
              { 'border-red-500 focus:ring-red-500': error },
              inputClassName
            )}
          >
            <option key={`${name}-placeholder-${label}`} value="" disabled>
              {placeholder || `Select ${label}`}
            </option>
            {options.map((option, index) => (
              <option key={`${name}-${label}-${option.value}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn(
              'absolute top-5 right-4 h-5 w-5 text-gray-400 pointer-events-none transition-transform duration-200',
              { 'rotate-180': isOpen }
            )}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={name}
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
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            'w-full p-4 appearance-none',
            'rounded-2xl bg-primaryBlue/20',
            'focus:outline-none focus:ring-2 focus:ring-primaryBlue/50',
            'text-titlePrimaryBlue font-poppins',
            { 'opacity-60 cursor-not-allowed': disabled },
            { 'border-red-500 focus:ring-red-500': error },
            inputClassName
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={name}
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
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full p-4 pr-10 pl-6 appearance-none',
          'rounded-full bg-primaryBlue/20',
          'focus:outline-none focus:ring-2 focus:ring-primaryBlue/50',
          'text-titlePrimaryBlue font-poppins text-center',
          { 'opacity-60 cursor-not-allowed': disabled },
          { 'border-red-500 focus:ring-red-500': error },
          inputClassName
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
