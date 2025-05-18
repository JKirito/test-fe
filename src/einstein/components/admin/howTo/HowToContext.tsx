import { createContext, useContext, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/config/axiosConfig';
import { HowTo, HowToWithChildren, FilterRelationship } from './types/howTo.types';
import { useState } from 'react';

interface FiltersType {
  sector?: string;
  subsector?: string;
  buildType?: string;
  // lifecycle removed
}

interface HowToContextType {
  howTos: HowToWithChildren[];
  selectedHowTo: HowTo | null;
  filterOptions: any[] | null; // Changed from GroupedFilterOptions to any[]
  filterRelationships: Record<string, FilterRelationship>;
  selectedFilters: FiltersType;
  setSelectedFilters: (filters: FiltersType) => void;
  setSelectedHowTo: (howTo: HowTo | null) => void;
  refreshHowTos: () => Promise<void>;
  isLoading: boolean;
  applyFilters: (filters: FiltersType) => void;
  appliedFilters: FiltersType;
  isLoadingFromUrl: boolean;
}

const HowToContext = createContext<HowToContextType | undefined>(undefined);

export const HowToProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [selectedHowTo, setSelectedHowTo] = useState<HowTo | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FiltersType>({});
  const [appliedFilters, setAppliedFilters] = useState<FiltersType>({});
  const [filterRelationships, setFilterRelationships] = useState<
    Record<string, FilterRelationship>
  >({});
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(true);

  // Fetch filter options
  const filterOptionsQuery = useQuery<any>({
    queryKey: ['howToFilterOptions'],
    queryFn: async () => {
      const response = await apiClient.get('/how-to/filter-hierarchy/tree');
      const treeData = response.data.data;

      // Build a simplified relationships map for backward compatibility
      const relationships: Record<string, FilterRelationship> = {};

      // Helper function to process the tree and build relationships
      const buildRelationships = (filters: any[]) => {
        filters.forEach((filter) => {
          // Track relationships
          relationships[filter._id] = {
            id: filter._id,
            parentId: filter.parentId || null,
            children: filter.children?.map((child: any) => child._id) || [],
            filterType: filter.filterType,
          };

          // Process children recursively
          if (filter.children && filter.children.length > 0) {
            buildRelationships(filter.children);
          }
        });
      };

      buildRelationships(treeData);
      setFilterRelationships(relationships);

      return treeData;
    },
    staleTime: 60 * 60 * 1000, // 1 hour cache
  });

  // Function to apply filters and trigger data fetching
  const applyFilters = (filters: FiltersType) => {
    setAppliedFilters(filters);

    // Update URL parameters when filters are applied (but not during initial load from URL)
    if (!isLoadingFromUrl) {
      const newParams = new URLSearchParams();

      if (filters.sector) {
        newParams.set('sector', filters.sector);
      }

      if (filters.subsector) {
        newParams.set('subsector', filters.subsector);
      }

      if (filters.buildType) {
        newParams.set('buildType', filters.buildType);
      }

      // Update URL without adding to browser history
      const newUrl = newParams.toString()
        ? `${window.location.pathname}?${newParams.toString()}`
        : window.location.pathname;

      window.history.replaceState(null, '', newUrl);
      // // console.log('[HowToContext] Updated URL with filters:', newUrl);
    }
  };

  // Fetch how-tos only when filters are applied
  const howTosQuery = useQuery<HowToWithChildren[]>({
    queryKey: ['howTos', appliedFilters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filterOptionsQuery.data) {
        // No need to use treeData or findFilterById since we're passing IDs directly

        if (appliedFilters.sector) {
          // Pass the sector ID directly
          params.append('sector', appliedFilters.sector);
        }

        if (appliedFilters.subsector) {
          // Pass the subsector ID directly
          params.append('subsector', appliedFilters.subsector);
        }

        if (appliedFilters.buildType) {
          // Pass the buildType ID directly
          params.append('buildType', appliedFilters.buildType);
        }

        // Lifecycle filter handling removed
      }

      // The API now expects object IDs instead of text values
      const response = await apiClient.get(`/how-to/filtered-hierarchy?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!(appliedFilters.sector && appliedFilters.buildType),
  });

  const refreshHowTos = async () => {
    await queryClient.invalidateQueries({ queryKey: ['howTos'] });
  };

  // Only consider howTosQuery loading when filters are applied
  const isDataLoading =
    howTosQuery.isLoading && !!(appliedFilters.sector && appliedFilters.buildType);

  // Load filters from URL parameters when filter options are loaded
  // Use a ref to track if we've already loaded from URL
  const hasLoadedFromUrlRef = useRef(false);

  useEffect(() => {
    // Skip if filter options aren't loaded yet
    if (!filterOptionsQuery.data) {
      return;
    }

    // Skip if we're not loading from URL or if we've already loaded
    if (!isLoadingFromUrl || hasLoadedFromUrlRef.current) {
      return;
    }

    // Mark that we've loaded from URL
    hasLoadedFromUrlRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const sectorParam = urlParams.get('sector');
    const subsectorParam = urlParams.get('subsector');
    const buildTypeParam = urlParams.get('buildType');

    if (sectorParam || subsectorParam || buildTypeParam) {
      // Create a filters object from URL parameters
      const filtersFromURL: FiltersType = {};

      // Helper function to validate filter exists in the tree
      const validateFilter = (id: string, filterType: string): boolean => {
        // Recursive function to find a filter by ID and type in the tree
        const findFilterInTree = (filters: any[]): boolean => {
          for (const filter of filters) {
            if (filter._id === id && filter.filterType === filterType) {
              return true;
            }

            if (filter.children && filter.children.length > 0) {
              if (findFilterInTree(filter.children)) {
                return true;
              }
            }
          }
          return false;
        };

        return findFilterInTree(filterOptionsQuery.data);
      };

      // Helper function to validate filter chain
      const validateFilterChain = (
        sector: string,
        subsector?: string,
        buildType?: string
      ): boolean => {
        // Find the sector
        const findSector = (filters: any[]): any => {
          for (const filter of filters) {
            if (filter._id === sector && filter.filterType === 'sector') {
              return filter;
            }

            if (filter.children && filter.children.length > 0) {
              const found = findSector(filter.children);
              if (found) return found;
            }
          }
          return null;
        };

        const sectorObj = findSector(filterOptionsQuery.data);
        if (!sectorObj) return false;

        // If subsector is provided, validate it belongs to the sector
        if (subsector) {
          const findSubsector = (filters: any[]): any => {
            for (const filter of filters) {
              if (
                filter._id === subsector &&
                filter.filterType === 'subsector' &&
                filter.parentId === sector
              ) {
                return filter;
              }

              if (filter.children && filter.children.length > 0) {
                const found = findSubsector(filter.children);
                if (found) return found;
              }
            }
            return null;
          };

          const subsectorObj = findSubsector(filterOptionsQuery.data);
          if (!subsectorObj) return false;

          // If buildType is provided, validate it belongs to the subsector
          if (buildType) {
            const findBuildType = (filters: any[]): any => {
              for (const filter of filters) {
                if (
                  filter._id === buildType &&
                  filter.filterType === 'buildType' &&
                  filter.parentId === subsector
                ) {
                  return filter;
                }

                if (filter.children && filter.children.length > 0) {
                  const found = findBuildType(filter.children);
                  if (found) return found;
                }
              }
              return null;
            };

            return !!findBuildType(filterOptionsQuery.data);
          }
        } else if (buildType) {
          // If only sector and buildType are provided, validate buildType belongs to a subsector of the sector
          const findBuildType = (filters: any[]): any => {
            for (const filter of filters) {
              if (filter._id === buildType && filter.filterType === 'buildType') {
                // Check if parent subsector belongs to the sector
                const parentId = filter.parentId;
                const findParentSubsector = (filters: any[]): any => {
                  for (const f of filters) {
                    if (
                      f._id === parentId &&
                      f.filterType === 'subsector' &&
                      f.parentId === sector
                    ) {
                      return f;
                    }

                    if (f.children && f.children.length > 0) {
                      const found = findParentSubsector(f.children);
                      if (found) return found;
                    }
                  }
                  return null;
                };

                return !!findParentSubsector(filterOptionsQuery.data);
              }

              if (filter.children && filter.children.length > 0) {
                const found = findBuildType(filter.children);
                if (found) return found;
              }
            }
            return false;
          };

          return findBuildType(filterOptionsQuery.data);
        }

        return true; // If only sector is provided or validation passed
      };

      // Validate and add filters
      if (sectorParam && validateFilter(sectorParam, 'sector')) {
        filtersFromURL.sector = sectorParam;
      }

      if (subsectorParam && validateFilter(subsectorParam, 'subsector')) {
        filtersFromURL.subsector = subsectorParam;
      }

      if (buildTypeParam && validateFilter(buildTypeParam, 'buildType')) {
        filtersFromURL.buildType = buildTypeParam;
      }

      // Validate the filter chain
      if (
        filtersFromURL.sector &&
        validateFilterChain(
          filtersFromURL.sector,
          filtersFromURL.subsector,
          filtersFromURL.buildType
        )
      ) {
        // // console.log('[HowToContext] Valid filter chain found in URL:', filtersFromURL);

        // Apply filters if we have at least sector and buildType
        if (filtersFromURL.sector && filtersFromURL.buildType) {
          // // console.log('[HowToContext] Applying filters from URL:', filtersFromURL);
          setSelectedFilters(filtersFromURL);
          applyFilters(filtersFromURL);
        }
      } else {
        console.warn('[HowToContext] Invalid filter chain in URL parameters');
      }
    }

    // Set loading from URL to false after a short delay to ensure filters are applied
    setTimeout(() => {
      // console.log('[HowToContext] Finished loading from URL, setting isLoadingFromUrl to false');
      setIsLoadingFromUrl(false);
    }, 1000); // Increased delay to ensure filters are fully applied
  }, [filterOptionsQuery.data, isLoadingFromUrl, applyFilters, setSelectedFilters]);

  const value = {
    howTos: howTosQuery.data || [],
    filterOptions: filterOptionsQuery.data || null,
    filterRelationships,
    selectedHowTo,
    selectedFilters,
    setSelectedFilters,
    setSelectedHowTo,
    refreshHowTos,
    isLoading: isDataLoading || filterOptionsQuery.isLoading,
    applyFilters,
    appliedFilters,
    isLoadingFromUrl,
  };

  return <HowToContext.Provider value={value}>{children}</HowToContext.Provider>;
};

export const useHowTo = () => {
  const context = useContext(HowToContext);
  if (!context) {
    throw new Error('useHowTo must be used within a HowToProvider');
  }
  return context;
};
