import type { FilterOptions } from './filters';

export const INITIAL_FILTER_OPTIONS: FilterOptions = {
  industry: [],
  city: [],
  serviceOffering: [],
  plannedRevenue: [],
  status: [],
  projectIds: [],
  gfa: [],
};

export const FILTER_STORAGE_KEY = 'galileoBenchmarkActiveFilters';

export const FILTERS_QUERY_KEY = 'galileoBenchmarkFilters';
