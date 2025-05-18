import React from 'react';
import { useBenchmark } from '../../store';
import { FilterOptions } from '../../filters';
import MultiSelectTag from '@/einstein/components/common/multiSelectTag/MultiSelectTag';

type StringArrayFilterKeys = keyof Pick<
  FilterOptions,
  'industry' | 'city' | 'serviceOffering' | 'status' | 'projectIds' | 'plannedRevenue'
>;

interface FilterOptionProps {
  filterKey: StringArrayFilterKeys;
  label: string;
  prefix?: boolean;
}

const FilterOption: React.FC<FilterOptionProps> = ({ filterKey, label, prefix }) => {
  const { filterOptions, activeFilters, setActiveFilters } = useBenchmark();

  if (!filterOptions || !filterOptions[filterKey]) {
    return <div>No filters named {filterKey}</div>;
  }

  // Normalize options whether they come as strings or as objects (for plannedRevenue)
  let options: { value: string; label: string }[] = [];
  if (filterKey === 'plannedRevenue') {
    options = (filterOptions[filterKey] as { value: string; label: string }[]).map(
      (option) => option
    );
  } else {
    options = (filterOptions[filterKey] as string[]).map((opt) => ({ value: opt, label: opt }));
  }

  // Use activeFilters as an array – default to an empty array if not set
  const active = (activeFilters[filterKey] as string[]) || [];

  const handleChange = (values: string[]) => {
    setActiveFilters({
      ...activeFilters,
      [filterKey]: values,
    });
  };

  return (
    <MultiSelectTag
      label={label}
      options={options}
      selectedValues={active}
      onChange={handleChange}
      prefix={prefix}
    />
  );
};

export default FilterOption;
