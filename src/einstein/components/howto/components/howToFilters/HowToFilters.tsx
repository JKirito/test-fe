import React, { useMemo } from 'react';
import { getSelectOptions } from '@/lib/store/features/howto/howtoSlice';
import styles from './HowToFilters.module.scss';
import HowToDropdown from '../howToDropdown/HowToDropdown';
import {
  FilterRelationship,
  GroupedFilterOptions,
} from '@/einstein/components/admin/howTo/types/filterOptions.types';
import animationStyles from '@/styles/theme/animations.module.scss';

export interface HowToFiltersProps {
  filterOptions: GroupedFilterOptions;
  filterRelationships: Record<string, FilterRelationship>;
  selectedFilters: {
    sector?: string;
    subsector?: string;
    buildType?: string;
    // lifecycle removed
  };
  onFilterChange: (filterType: string, value: string) => void;
}

/**
 * Component for displaying filter dropdowns for the HowTo page
 */
const HowToFilters: React.FC<HowToFiltersProps> = ({
  filterOptions,
  filterRelationships,
  selectedFilters,
  onFilterChange,
}) => {
  // Get subsectors for the selected sector
  const subsectorOptions = useMemo(() => {
    if (!selectedFilters.sector) return [];

    // Find subsectors that have this sector as parent
    return filterOptions.subsectors.filter(
      (subsector) => subsector.parentId === selectedFilters.sector
    );
  }, [filterOptions.subsectors, selectedFilters.sector]);

  // Get build types for the selected subsector or sector
  const buildTypeOptions = useMemo(() => {
    // If subsector is selected, show only its build types
    if (selectedFilters.subsector) {
      return filterOptions.buildTypes.filter(
        (buildType) => buildType.parentId === selectedFilters.subsector
      );
    }

    // If only sector is selected, show build types directly under the sector
    if (selectedFilters.sector) {
      return filterOptions.buildTypes.filter(
        (buildType) => buildType.parentId === selectedFilters.sector
      );
    }

    // Otherwise show all build types
    return [];
  }, [filterOptions.buildTypes, selectedFilters.sector, selectedFilters.subsector]);

  // Check if a filter has viable children all the way through the chain
  const hasViableFilterChain = (filterId: string): boolean => {
    // Check if this filter has any direct children
    const directChildren = Object.values(filterRelationships).filter(
      (rel) => rel.parentId === filterId
    );

    if (directChildren.length === 0) {
      return false;
    }

    // Check if any of the children are build types (which can be selected)
    const hasBuildTypes = directChildren.some((child) => child.filterType === 'buildType');

    // Check if any of the children are subsectors that have viable children
    const hasViableSubsectors = directChildren
      .filter((child) => child.filterType === 'subsector')
      .some((subsector) => hasViableFilterChain(subsector.id));

    return hasBuildTypes || hasViableSubsectors;
  };

  // Process options to mark those without viable children as disabled
  const processSectorOptions = (options: any) => {
    return getSelectOptions(options).map((option) => {
      // Check if this sector has a viable filter chain
      const isViable = hasViableFilterChain(option.value);

      return {
        ...option,
        disabled: !isViable,
      };
    });
  };

  const processSubsectorOptions = (options: any) => {
    return getSelectOptions(options).map((option) => {
      // Check if this subsector has viable build types
      const hasBuildTypes = Object.values(filterRelationships).some(
        (rel) => rel.parentId === option.value && rel.filterType === 'buildType'
      );

      return {
        ...option,
        disabled: !hasBuildTypes,
      };
    });
  };

  // Process build type options to check if they have associated data
  const processBuildTypeOptions = (options: any) => {
    return getSelectOptions(options);
  };

  return (
    <div className={`${styles.howToFilters} ${animationStyles.fade}`}>
      <span className={styles.title}>Filters</span>
      <HowToDropdown
        text="Sector"
        options={processSectorOptions(filterOptions.sectors)}
        onChange={(value) => onFilterChange('sector', value)}
        selectedValue={selectedFilters.sector}
        disabled={filterOptions.sectors.length === 0}
      />

      <HowToDropdown
        text="Sub Sector"
        options={processSubsectorOptions(subsectorOptions)}
        onChange={(value) => onFilterChange('subsector', value)}
        selectedValue={selectedFilters.subsector}
        disabled={!selectedFilters.sector || subsectorOptions.length === 0}
      />

      <HowToDropdown
        text="How To Build"
        options={processBuildTypeOptions(buildTypeOptions)}
        onChange={(value) => onFilterChange('buildType', value)}
        selectedValue={selectedFilters.buildType}
        disabled={!selectedFilters.sector || buildTypeOptions.length === 0}
      />
    </div>
  );
};

export default HowToFilters;
