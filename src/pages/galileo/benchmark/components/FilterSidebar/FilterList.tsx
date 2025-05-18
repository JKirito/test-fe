import React from 'react';
import { useBenchmark } from '../../store';
import './FilterList.scss';
import FilterOption from './FilterOption';
import ProjectItemFilter from './ProjectItemFilter';
import RangeSlider from './RangeSlider';

export const FilterList: React.FC = () => {
  const { filterOptions } = useBenchmark();

  // Log filter options to debug
  // // console.log('FilterList - filterOptions:', filterOptions);
  // // console.log('FilterList - GFA exists:', filterOptions?.gfa);

  if (!filterOptions) {
    return <div>Loading filter options...</div>;
  }

  return (
    <div className="filter-list">
      <ProjectItemFilter
        fieldName="customername"
        suggestionTitleKey="customername"
        suggestionSubtitleKey="projectdirector"
        placeholder="Search by customer name"
      />
      <ProjectItemFilter
        fieldName="projectname"
        suggestionTitleKey="projectname"
        suggestionSubtitleKey="projectdirector"
        placeholder="Search by project name"
      />
      <div className="divider"></div>
      <FilterOption filterKey="industry" label="Sector" />
      <FilterOption filterKey="city" label="City" />
      <FilterOption filterKey="serviceOffering" label="Service Offering" />
      <FilterOption filterKey="plannedRevenue" label="Select Planned Revenue Tiers" prefix={true} />
      <FilterOption filterKey="status" label="Status" />
      {/* Always show the GFA filter */}
      <RangeSlider
        filterKey="gfa"
        label="Gross Floor Area"
        min={0}
        max={120000}
        step={1000}
        unit="m²"
        showInputs={false} // Hide input boxes for GFA filter
      />
    </div>
  );
};

export default FilterList;
