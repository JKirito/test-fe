import React from 'react';
import { SelectedFilters } from '@/lib/store/features/howto/howtoSlice';
import { Spinner } from '@/einstein/components/common/Spinner';
import HowToFilters from '../howToFilters/HowToFilters';
import './HowToFilterWrapper.scss';
import { FilterRelationship } from '@/einstein/components/admin/howTo/types/filterOptions.types';
import { GroupedFilterOptions } from '@/einstein/components/admin/howTo/types/filterOptions.types';

interface HowToFilterWrapperProps {
  filterOptions: GroupedFilterOptions | null;
  filterRelationships: Record<string, FilterRelationship>;
  selectedFilters: SelectedFilters;
  onFilterChange: (filterType: string, value: string) => void;
}

/**
 * Wraps the HowToFilters component, handling the loading state for filter options.
 */
const HowToFilterWrapper: React.FC<HowToFilterWrapperProps> = ({
  filterOptions,
  filterRelationships,
  selectedFilters,
  onFilterChange,
}) => {
  return (
    <div className="howto-filter-wrapper">
      {filterOptions ? (
        <HowToFilters
          filterOptions={filterOptions}
          filterRelationships={filterRelationships}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
        />
      ) : (
        <div className="howto-filter-wrapper__loading">
          <Spinner className="howto-filter-wrapper__spinner" />
          <span className="howto-filter-wrapper__loading-text">Loading filters...</span>
        </div>
      )}
    </div>
  );
};

export default HowToFilterWrapper;
