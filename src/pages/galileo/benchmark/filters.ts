export interface FilterOptions {
  industry: string[];
  city: string[];
  serviceOffering: string[];
  plannedRevenue: {
    label: string;
    value: string;
  }[];
  status: string[];
  projectIds: string[];
  gfa: string[];
}

export type ActiveFilters = Partial<{
  [K in keyof FilterOptions]: FilterOptions[K] extends Array<infer T> ? T[] : FilterOptions[K];
}>;

export interface FilterResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: number;
}

export interface ApplyFiltersParams {
  filters: ActiveFilters;
  page: number;
  limit?: number;
}
