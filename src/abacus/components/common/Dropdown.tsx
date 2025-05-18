import { cn } from '@/lib/utils/tailwind';
import { ChevronDown } from 'lucide-react';
import type { ClassNameValue } from 'tailwind-merge';

interface DropdownProps {
  data: string[];
  placeholder?: string;
  onSelect?: (value: string) => void;
  inputClassName?: ClassNameValue;
  value?: string;
  name?: string;
  required?: boolean;
}

const Dropdown = ({
  data,
  placeholder = 'Select...',
  onSelect,
  inputClassName,
  value,
  name,
  required = false,
}: DropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue !== '') {
      // Don't trigger for placeholder
      onSelect?.(selectedValue);
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <select
          value={value || ''}
          onChange={handleChange}
          name={name}
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
            inputClassName
          )}
        >
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
          {data.map((item, index) => (
            <option key={index} value={item} className="py-2">
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className={cn('absolute right-4 h-5 w-5 text-gray-400 pointer-events-none')} />
      </div>
    </div>
  );
};

export default Dropdown;
