import { useFilterContext } from '../context/FilterContext';
import { Filters } from '../context/FilterContext';
import MultiSelectTag from '@/einstein/components/common/multiSelectTag/MultiSelectTag';

const FilterOption = ({
  filterKey,
  label,
  prefix,
}: {
  filterKey: keyof Filters;
  label: string;
  prefix?: boolean;
}) => {
  const { filters, activeFilters, setActiveFilters } = useFilterContext();
  // console.log(`FilterOption ${filterKey} - filters:`, filters);
  // console.log(`FilterOption ${filterKey} - activeFilters:`, activeFilters);

  if (!filters || !filters[filterKey]) {
    console.error(`No filters found for key: ${filterKey}`, filters);
    return <div>No filters named {filterKey}</div>;
  }

  // Normalize options whether they come as strings or as objects (for plannedRevenue)
  let options: { value: string; label: string }[] = [];
  if (filterKey === 'plannedRevenue') {
    options = (filters[filterKey] as { value: string; label: string }[]).map((option) => option);
  } else {
    options = (filters[filterKey] as string[]).map((opt) => ({ value: opt, label: opt }));
  }

  // Use activeFilters as an array – default to an empty array if not set
  const active = activeFilters[filterKey] || [];

  return (
    <MultiSelectTag
      label={label}
      prefix={prefix}
      options={options}
      selectedValues={active}
      onChange={(values) => setActiveFilters((prev) => ({ ...prev, [filterKey]: values }))}
    />
  );
};

export default FilterOption;
