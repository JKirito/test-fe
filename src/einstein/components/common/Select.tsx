interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
  labelClassName?: string;
}

const Select = ({
  value,
  onValueChange,
  options,
  label,
  className,
  labelClassName,
}: SelectProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className={`text-sm ${labelClassName}`}>{label}</span>}
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
