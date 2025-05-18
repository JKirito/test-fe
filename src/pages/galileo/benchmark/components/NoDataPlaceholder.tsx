import React from 'react';
import './NoDataPlaceholder.scss';

/**
 * Placeholder component shown when no filters have been applied yet
 */
const NoDataPlaceholder: React.FC = () => {
  return (
    <div className="no-data-placeholder">
      <div className="no-data-placeholder__content">
        <img 
          src="/icons/filter.svg" 
          alt="Filter icon" 
          className="no-data-placeholder__icon" 
        />
        <h2 className="no-data-placeholder__title">No Data Selected</h2>
        <p className="no-data-placeholder__message">
          Use the filter sidebar to select projects and apply filters.
          <br />
          Once you've applied filters, the data will appear here.
        </p>
      </div>
    </div>
  );
};

export default NoDataPlaceholder;
