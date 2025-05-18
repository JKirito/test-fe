import React from 'react';

interface GeneralSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;

  onChange: (value: string) => void;
}

const GeneralSelect: React.FC<GeneralSelectProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GeneralSelect;
