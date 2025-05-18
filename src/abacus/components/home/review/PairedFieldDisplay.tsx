// src/abacus/components/home/review/PairedFieldDisplay.tsx
import React from 'react';
import { PairedField } from './types';
import './PairedFieldDisplay.scss'; // Import SCSS

interface PairedFieldDisplayProps {
  field: PairedField;
  // className is now used for BEM modifiers primarily
  modifier?: 'min-width' | 'full-width' | string; // Allow specific modifiers or general class pass-through
}

const PairedFieldDisplay: React.FC<PairedFieldDisplayProps> = ({ field, modifier }) => {
  const baseClass = 'pairedFieldDisplay';
  const modifierClass = modifier ? `${baseClass}--${modifier}` : '';

  return (
    <div className={`${baseClass} ${modifierClass}`.trim()}>
      <span className={`${baseClass}__label`}>{field.label}</span>
      <span className={`${baseClass}__value`}>{field.value || 'Not provided'}</span>
    </div>
  );
};

export default PairedFieldDisplay;
