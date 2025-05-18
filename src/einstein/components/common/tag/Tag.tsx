import React from 'react';
// Import the SCSS file for its side effects
import './Tag.scss';

interface TagProps {
  label: string;
  onRemove: () => void;
}

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    // Use the BEM block class
    <div className="tag">
      {/* Use the BEM element class */}
      <span className="tag__label">{label}</span>
      {/* Use the BEM element class */}
      <button type="button" onClick={onRemove} className="tag__removeButton">
        <img src="/icons/close.svg" alt="Close" />
      </button>
    </div>
  );
};

export default Tag;
