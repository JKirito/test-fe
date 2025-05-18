import FilterOption from './FilterOption';
import ProjectItemFilter from './ProjectItemFilter';
import LocationSearch from './LocationSearch';
import './FilterList.scss';

export const FilterList = () => {
  return (
    <div className="filter-list">
      <LocationSearch placeholder="Search By Location" minSearchLength={3} debounce={300} />
      <ProjectItemFilter
        fieldName="customername"
        suggestionTitleKey="customername"
        suggestionSubtitleKey="projectdirector"
        placeholder="Search by customer name"
        onSelect={(item: unknown) => console.log('Selected item:', item)}
      />
      <ProjectItemFilter
        fieldName="projectname"
        suggestionTitleKey="projectname"
        suggestionSubtitleKey="projectdirector"
        placeholder="Search by project name"
        onSelect={(item: unknown) => console.log('Selected item:', item)}
      />
      <div className="divider"></div>
      <FilterOption filterKey="industry" label="Sector" />
      <FilterOption filterKey="city" label="City" />
      <FilterOption filterKey="serviceOffering" label="Service Offering" />
      <FilterOption filterKey="plannedRevenue" label="Select Planned Revenue Tiers" prefix={true} />
      <FilterOption filterKey="status" label="Status" />
    </div>
  );
};
