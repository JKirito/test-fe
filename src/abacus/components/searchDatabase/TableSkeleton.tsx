import React from 'react';
import './TableSkeleton.scss';

const TableSkeleton: React.FC = () => {
  // Create an array of columns to match the actual table
  const columns = Array(15).fill(0);
  // Create rows for the skeleton
  const rows = Array(5).fill(0);

  return (
    <div className="abacus-table-skeleton">
      <div className="abacus-table-skeleton__wrapper">
        <div className="abacus-table-skeleton__header">
          {columns.map((_, index) => (
            <div key={`header-${index}`} className="abacus-table-skeleton__header-cell">
              <div className="abacus-table-skeleton__pulse" />
            </div>
          ))}
        </div>
        <div className="abacus-table-skeleton__body">
          {rows.map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="abacus-table-skeleton__row">
              {columns.map((_, colIndex) => (
                <div key={`cell-${rowIndex}-${colIndex}`} className="abacus-table-skeleton__cell">
                  <div className="abacus-table-skeleton__pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
