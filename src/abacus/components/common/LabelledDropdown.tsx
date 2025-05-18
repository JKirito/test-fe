import { cn } from '@/lib/utils/tailwind';
import { ChevronDown } from 'lucide-react';
import type { ClassNameValue } from 'tailwind-merge';
import { useState, useRef, useEffect } from 'react';

interface LabelledDropdownProps<T> {
  label?: string;
  data?: string[];
  placeholder?: string;
  onSelect?: (value: string) => void;
  containerClassName?: ClassNameValue;
  labelClassName?: ClassNameValue;
  inputClassName?: ClassNameValue;
  value?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  fetchData?: () => Promise<T[]>;
  // These functions help transform the data for display and value
  getOptionLabel?: (item: T) => string;
  getOptionValue?: (item: T) => string;
}

const LabelledDropdown = <T = string,>({
  label,
  data = [],
  placeholder = 'Select...',
  onSelect,
  containerClassName,
  labelClassName,
  inputClassName,
  value,
  name,
  required = false,
  disabled = false,
  error,
  fetchData,
  getOptionLabel = (item: T) => String(item),
  getOptionValue = (item: T) => String(item),
}: LabelledDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [currentData, setCurrentData] = useState<T[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue !== '') {
      onSelect?.(selectedValue);
      setTimeout(() => setIsOpen(false), 100);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (fetchData && !disabled) {
        // // console.log('fetching data');
        const fetchedData = await fetchData();
        setCurrentData(fetchedData);
      } else if (data.length > 0) {
        setCurrentData(data.map((item) => ({ value: item, label: item })) as unknown as T[]);
      }
    };

    loadData();

    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [disabled, value]);

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
          value={value || ''}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          name={name}
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
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
          {currentData.map((item, index) => (
            <option key={index} value={getOptionValue(item)} className="py-2">
              {getOptionLabel(item)}
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
};

export default LabelledDropdown;
