import { HowToFilterType, HowToFilterOption } from './types/howTo.types';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useHowTo } from './HowToContext';
import Select from '../../common/select/CustomSelect';
import filterConfig from './config/filterConfig';

const Filters = ({ filterOptions }: { filterOptions: any[] }) => {
  const { selectedFilters, setSelectedFilters, applyFilters, filterRelationships } = useHowTo();
  const [localFilters, setLocalFilters] = useState(selectedFilters);

  // Use a ref to track previous selected filters to avoid circular updates
  const prevSelectedFiltersRef = useRef(JSON.stringify(selectedFilters));

  // Update local filters when selected filters change (e.g., from URL parameters)
  useEffect(() => {
    const currentSelectedFiltersStr = JSON.stringify(selectedFilters);
    const prevSelectedFiltersStr = prevSelectedFiltersRef.current;

    // Only update if the selected filters have actually changed
    if (currentSelectedFiltersStr !== prevSelectedFiltersStr) {
      // // console.log('[Filters] selectedFilters changed:', selectedFilters);

      // Update the local filters
      setLocalFilters(selectedFilters);

      // Update the ref with the current selected filters
      prevSelectedFiltersRef.current = currentSelectedFiltersStr;
    }
  }, [selectedFilters]); // Only depend on selectedFilters, not localFilters

  // Helper function to find a filter by ID in the tree
  const findFilterById = (filters: any[], id: string): any | null => {
    for (const filter of filters) {
      if (filter._id === id) return filter;

      if (filter.children && filter.children.length > 0) {
        const found = findFilterById(filter.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Get all filters of a specific type from the tree
  const getFiltersByType = (filters: any[], filterType: string): any[] => {
    let result: any[] = [];

    for (const filter of filters) {
      if (filter.filterType === filterType) {
        result.push(filter);
      }

      if (filter.children && filter.children.length > 0) {
        result = [...result, ...getFiltersByType(filter.children, filterType)];
      }
    }

    return result;
  };

  // Check if selected sector has subsectors
  const hasSubsectors = useMemo(() => {
    if (!localFilters.sector) return false;

    // Find the selected sector
    const selectedSector = findFilterById(filterOptions, localFilters.sector);

    // Check if it has any subsector children
    return (
      selectedSector?.children?.some((child: any) => child.filterType === 'subsector') || false
    );
  }, [filterOptions, localFilters.sector, findFilterById]);

  // Check for viable filter chains recursive function
  const hasViableFilterChain = (filterId: string): boolean => {
    // Check if this filter has any direct children
    const directChildren = Object.values(filterRelationships).filter(
      (rel) => rel.parentId === filterId
    );

    if (directChildren.length === 0) {
      // If it's a buildType, it's viable as the end of a chain
      const filter = Object.values(filterRelationships).find((f) => f.id === filterId);
      return filter?.filterType === 'buildType';
    }

    // Check if any of the children are build types (which can be selected)
    const hasBuildTypes = directChildren.some((child) => child.filterType === 'buildType');

    // Check if any of the children are subsectors that have viable children
    const hasViableSubsectors = directChildren
      .filter((child) => child.filterType === 'subsector')
      .some((subsector) => hasViableFilterChain(subsector.id));

    // A filter is viable if it leads to a build type eventually
    return hasBuildTypes || hasViableSubsectors;
  };

  // Process options based on filter config
  const processFilterOptions = (options: HowToFilterOption[], filterType: HowToFilterType) => {
    const config = filterConfig[filterType];

    if (!config) return options; // No config, return as is

    return options.map((option) => {
      // Start with the option's current disabled state
      let isDisabled = !!option.disabled;

      // Check if this option is specifically disabled by ID
      if (config.disabledIds?.includes(option._id)) {
        isDisabled = true;
      }

      // Check if this option is specifically enabled by ID (overrides other rules)
      if (config.enabledIds?.includes(option._id)) {
        isDisabled = false;
      }
      // Check if we should disable options that don't lead to build types
      else if (config.disableIfNoViableChain && !hasViableFilterChain(option._id)) {
        isDisabled = true;
      }

      return {
        ...option,
        disabled: isDisabled,
      };
    });
  };

  // Process options for Sectors
  const processSectorOptions = (options: HowToFilterOption[]) => {
    return processFilterOptions(options, HowToFilterType.SECTOR);
  };

  // Process options for Subsectors
  const processSubsectorOptions = (options: HowToFilterOption[]) => {
    return processFilterOptions(options, HowToFilterType.SUBSECTOR);
  };

  // Process options for Build Types
  const processBuildTypeOptions = (options: HowToFilterOption[]) => {
    return processFilterOptions(options, HowToFilterType.BUILD_TYPE);
  };

  // Get subsectors for the selected sector
  const subsectorOptions = useMemo(() => {
    if (!localFilters.sector) return [];

    // Find the selected sector
    const selectedSector = findFilterById(filterOptions, localFilters.sector);

    // Get its subsector children
    const subsectors =
      selectedSector?.children?.filter((child: any) => child.filterType === 'subsector') || [];

    return processSubsectorOptions(subsectors); // Process for disabled state
  }, [filterOptions, localFilters.sector, findFilterById, processSubsectorOptions]);

  // Get build types for the selected subsector or sector
  const buildTypeOptions = useMemo(() => {
    let buildTypes: any[] = [];

    if (localFilters.subsector) {
      // Find the selected subsector
      const selectedSubsector = findFilterById(filterOptions, localFilters.subsector);

      // Get its buildType children
      buildTypes =
        selectedSubsector?.children?.filter((child: any) => child.filterType === 'buildType') || [];
    } else if (localFilters.sector && (!hasSubsectors || subsectorOptions.length === 0)) {
      // Show build types under sector only if sector is selected AND
      // (EITHER this sector inherently has no subsectors OR the filtered subsectorOptions list is empty)
      const selectedSector = findFilterById(filterOptions, localFilters.sector);

      // Get its buildType children
      buildTypes =
        selectedSector?.children?.filter((child: any) => child.filterType === 'buildType') || [];
    }

    return processBuildTypeOptions(buildTypes); // Process for disabled state
  }, [
    filterOptions,
    localFilters.sector,
    localFilters.subsector,
    hasSubsectors,
    subsectorOptions.length,
    findFilterById,
    processBuildTypeOptions,
  ]);

  // Lifecycle filter removed

  const filterGroups = useMemo(
    () => [
      {
        key: 'sectors',
        label: HowToFilterType.SECTOR,
        options: processSectorOptions(getFiltersByType(filterOptions, 'sector')),
        disabled:
          filterConfig[HowToFilterType.SECTOR]?.disableCondition?.(
            localFilters,
            getFiltersByType(filterOptions, 'sector')
          ) || false,
        hidden: false,
      },
      {
        key: 'subsectors',
        label: HowToFilterType.SUBSECTOR,
        options: subsectorOptions, // Already processed
        disabled:
          filterConfig[HowToFilterType.SUBSECTOR]?.disableCondition?.(
            localFilters,
            subsectorOptions
          ) || false,
        hidden: false,
      },
      {
        key: 'buildTypes',
        label: HowToFilterType.BUILD_TYPE,
        options: buildTypeOptions, // Already processed
        disabled:
          filterConfig[HowToFilterType.BUILD_TYPE]?.disableCondition?.(
            localFilters,
            buildTypeOptions,
            hasSubsectors,
            subsectorOptions
          ) || false,
        hidden: false, // Keep visible, but disable based on logic
      },
      // Lifecycle filter removed
    ],
    [
      filterOptions,
      getFiltersByType,
      processSectorOptions,
      subsectorOptions,
      localFilters.sector,
      localFilters.subsector,
      buildTypeOptions,
      hasSubsectors,
      filterConfig, // Add filterConfig as a dependency
      // isLifecycleEnabled dependency removed
    ]
  );

  // Check if all required filters are selected
  const areRequiredFiltersSelected = (filters: typeof localFilters) => {
    const hasRequiredSectorFilters = hasSubsectors
      ? !!filters.sector && !!filters.subsector
      : !!filters.sector;

    return hasRequiredSectorFilters && !!filters.buildType;
    // Lifecycle filter requirement removed
  };

  // Apply filters when all required ones are selected
  const prevAppliedFiltersRef = useRef(JSON.stringify(localFilters));

  useEffect(() => {
    const currentLocalFiltersStr = JSON.stringify(localFilters);
    const prevAppliedFiltersStr = prevAppliedFiltersRef.current;

    // Skip if the filters haven't actually changed
    if (currentLocalFiltersStr === prevAppliedFiltersStr) {
      return;
    }

    // Update the ref with the current filters
    prevAppliedFiltersRef.current = currentLocalFiltersStr;

    // Only apply filters if all required ones are selected
    if (areRequiredFiltersSelected(localFilters)) {
      // console.log('[Filters] Applying filters:', localFilters);

      // Update the context filters
      setSelectedFilters(localFilters);
      applyFilters(localFilters);
    }
  }, [localFilters, setSelectedFilters, applyFilters, hasSubsectors, areRequiredFiltersSelected]);

  const handleFilterSelect = (filterType: HowToFilterType, value: string) => {
    // Create new filter state
    const updatedFilters = {
      ...localFilters,
      [filterType]: value || undefined, // Clear filter if empty
    };

    // If changing the sector, clear the subsector and buildType
    if (filterType === HowToFilterType.SECTOR) {
      updatedFilters.subsector = undefined;
      updatedFilters.buildType = undefined;
    }

    // If changing the subsector, clear the buildType
    if (filterType === HowToFilterType.SUBSECTOR) {
      updatedFilters.buildType = undefined;
    }

    // Lifecycle filter handling removed

    setLocalFilters(updatedFilters);
  };

  const formatLabel = (filterType: string) => {
    return filterType.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="bg-white py-4 px-4">
      <div className="grid grid-cols-4 gap-4">
        {filterGroups.map((group) => {
          if (group.hidden) {
            return null; // Skip rendering if hidden
          }

          const filterType = group.label;
          const filterValue = localFilters[filterType as keyof typeof localFilters] || '';

          // Transform options for the Select component
          const selectOptions = [
            // Add a "Clear Selection" or placeholder option
            { value: '', label: `Select ${formatLabel(group.label)}...` },
            // Map HowToFilterOption to SelectOption format
            ...group.options.map((option) => ({
              value: option._id,
              label: option.label,
              disabled: option.disabled,
            })),
          ];

          return (
            <Select
              key={group.key}
              label={`${formatLabel(group.label)}`}
              labelClassName="text-titlePrimaryBlue" // Apply class to the label
              options={selectOptions}
              value={filterValue}
              onValueChange={(value) => handleFilterSelect(group.label, value)}
              disabled={group.disabled}
              // No direct 'hidden' prop, handled by conditional rendering above
              containerClassName="w-full" // Ensure the container takes full width in the grid cell
            />
          );
        })}
      </div>

      {!areRequiredFiltersSelected(localFilters) && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Please select required filters to view how-to content
        </div>
      )}
    </div>
  );
};

export default Filters;
