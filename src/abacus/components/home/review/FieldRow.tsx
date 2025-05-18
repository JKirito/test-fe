// src/abacus/components/home/review/FieldRow.tsx
import React from 'react';
import { PairedField } from './types';
import PairedFieldDisplay from './PairedFieldDisplay';
import './FieldRow.scss'; // Import SCSS

interface FieldRowProps {
  fields: [PairedField, PairedField];
}

const FieldRow: React.FC<FieldRowProps> = ({ fields }) => (
  <div className="fieldRow">
    {/* Pass BEM modifiers directly */}
    <PairedFieldDisplay field={fields[0]} modifier="min-width" />
    <PairedFieldDisplay field={fields[1]} modifier="full-width" />
  </div>
);

export default FieldRow;
