// src/abacus/components/home/review/ReviewSection.tsx
import React from 'react';
import { PairedField } from './types';
import PairedFieldDisplay from './PairedFieldDisplay';
import FieldRow from './FieldRow';
import './ReviewSection.scss'; // Import SCSS

interface ReviewSectionProps {
  title: string;
  items: PairedField[];
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, items }) => {
  // Separate items for rows and individual display
  const rows: [PairedField, PairedField][] = [];
  const singles: PairedField[] = [];
  const remaining: PairedField[] = [];

  if (items.length >= 2) {
    rows.push([items[0], items[1]]);
  } else if (items.length === 1) {
    singles.push(items[0]);
  }

  if (items.length >= 3) {
    singles.push(items[2]);
  }

  if (items.length > 3) {
    remaining.push(...items.slice(3));
  }

  const halfIndex = Math.ceil(remaining.length / 2);
  const firstHalfRemaining = remaining.slice(0, halfIndex);
  const secondHalfRemaining = remaining.slice(halfIndex);

  return (
    <div className="reviewSection">
      <h3 className="reviewSection__title">{title}</h3>
      <div className="reviewSection__content">
        {rows.map((row, index) => (
          <FieldRow key={`row-${index}`} fields={row} />
        ))}
        {singles.map((single, index) => {
          const needsMargin = rows.length > 0 || index > 0;
          const wrapperClass =
            `reviewSection__singleFieldWrapper ${needsMargin ? 'reviewSection__singleFieldWrapper--marginTop' : ''}`.trim();
          return (
            <div key={`single-${index}`} className={wrapperClass}>
              <PairedFieldDisplay field={single} modifier="full-width" />
            </div>
          );
        })}

        {remaining.length > 0 && (
          <div className="reviewSection__remainingFieldsWrapper">
            {firstHalfRemaining.length > 0 && (
              <div className="reviewSection__remainingColumn">
                {firstHalfRemaining.map((item, index) => (
                  <PairedFieldDisplay key={`rem1-${index}`} field={item} modifier="full-width" />
                ))}
              </div>
            )}
            {secondHalfRemaining.length > 0 && (
              <div className="reviewSection__remainingColumn">
                {secondHalfRemaining.map((item, index) => (
                  <PairedFieldDisplay key={`rem2-${index}`} field={item} modifier="full-width" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
