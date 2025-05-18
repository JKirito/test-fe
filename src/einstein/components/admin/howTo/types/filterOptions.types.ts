/**
 * Enum for filter types
 */
export enum HowToFilterType {
  SECTOR = 'sector',
  SUBSECTOR = 'subsector',
  BUILD_TYPE = 'buildType',
  // LIFECYCLE removed
}

/**
 * Interface for a single filter option
 */
export interface FilterOption {
  _id: string;
  label: string;
  value: string;
  description?: string;
  filterType: HowToFilterType;
  order: number;
  parentId?: string | null;
  hierarchyPath?: string[];
  children?: FilterOption[];
  disabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for relationship between filters
 */
export interface FilterRelationship {
  id: string;
  parentId: string | null;
  children: string[];
  filterType: HowToFilterType;
}

/**
 * Interface for grouped filter options
 */
export interface GroupedFilterOptions {
  sectors: FilterOption[];
  subsectors: FilterOption[];
  buildTypes: FilterOption[];
  // lifecycles removed
}

/**
 * API response interfaces
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface FilterOptionsResponse extends ApiResponse<GroupedFilterOptions> { }

/**
 * Filter option creation input
 */
export interface CreateFilterOptionInput {
  label: string;
  value: string;
  filterType: HowToFilterType;
  description?: string;
  order?: number;
  parentId?: string | null;
}

/**
 * Filter option update input
 */
export interface UpdateFilterOptionInput {
  label?: string;
  value?: string;
  description?: string;
  order?: number;
  filterType?: HowToFilterType;
  parentId?: string | null;
}
