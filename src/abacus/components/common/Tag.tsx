import React from 'react';

interface TagProps {
  label: string;
  onRemove: () => void;
}

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
      >
        &times;
      </button>
    </div>
  );
};

export default Tag;
