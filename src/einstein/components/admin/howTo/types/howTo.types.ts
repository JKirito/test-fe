/**
 * Enum for How-To filter types
 */
export enum HowToFilterType {
  SECTOR = 'sector',
  SUBSECTOR = 'subsector',
  BUILD_TYPE = 'buildType',
  // LIFECYCLE removed
}

/**
 * Interface for filter options
 */
export interface HowToFilterOption {
  _id: string;
  label: string;
  value: string;
  description?: string;
  filterType: HowToFilterType;
  order: number;
  parentId?: string | null;
  hierarchyPath?: string[];
  children?: HowToFilterOption[];
  disabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for filter relationships
 */
export interface FilterRelationship {
  id: string;
  parentId: string | null;
  children: string[];
  filterType: HowToFilterType;
}

/**
 * Interface for attached files
 */
export interface AttachedFile {
  _id?: string;
  url: string;
  label: string;
  isLocal?: boolean;
  file?: File;
}

/**
 * Base How-To interface
 */
export interface HowTo {
  _id: string;
  title: string;
  description: string; // Keeping for backward compatibility
  overview?: string; // New field for rich text overview
  sector: HowToFilterOption;
  subsector?: HowToFilterOption;
  buildType: HowToFilterOption;
  parentId?: string | null;
  ruleOfThumb?: string;
  bestPractices?: string;
  keyInformation?: string;
  attachedFiles: AttachedFile[];
  createdAt?: string;
  updatedAt?: string;
  order?: string;
  children?: HowToWithChildren[];
}

/**
 * Extended How-To interface with children for hierarchy
 */
export interface HowToWithChildren extends HowTo {
  children?: HowToWithChildren[];
}

/**
 * API response interfaces
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  details?: unknown;
}

export interface HowToResponse extends ApiResponse<HowTo> { }
export interface HowToListResponse extends ApiResponse<HowTo[]> { }
export interface HowToHierarchyResponse extends ApiResponse<HowToWithChildren[]> { }

/**
 * Grouped filter options interface
 */
export interface GroupedFilterOptions {
  sectors: HowToFilterOption[];
  subsectors: HowToFilterOption[];
  buildTypes: HowToFilterOption[];
  // lifecycles removed
}

export interface FilterOptionsResponse extends ApiResponse<GroupedFilterOptions> { }

/**
 * Create/Update How-To input types
 */
export interface CreateHowToInput {
  title: string;
  description?: string; // Keeping for backward compatibility
  overview?: string; // New field for rich text overview
  content?: string;
  parentId?: string | null;
  sector: string;
  subsector?: string;
  buildType: string;
  order?: string;
  ruleOfThumb?: string;
  bestPractices?: string;
  keyInformation?: string;
  attachedFiles?: AttachedFile[];
}

export type UpdateHowToInput = Partial<CreateHowToInput>;

/**
 * Query parameters for How-To endpoints
 */
export interface HowToQueryParams {
  parentId?: string;
}
