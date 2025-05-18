/**
 * Configuration for filter disabling in the How To Admin section
 */

import { HowToFilterType } from '../types/howTo.types';

/**
 * Interface for filter disabling rules
 */
export interface FilterDisableRule {
  // The filter type this rule applies to
  filterType: HowToFilterType;
  // IDs of specific filter options to disable (regardless of other rules)
  disabledIds?: string[];
  // IDs of specific filter options to enable (overrides other disable rules)
  enabledIds?: string[];
  // Whether to disable options that don't lead to any build types
  disableIfNoViableChain?: boolean;
  // Whether to disable the entire filter group based on conditions
  disableCondition?: (filters: any, options: any[], ...args: any[]) => boolean;
}

/**
 * Configuration for filter disabling
 */
const filterConfig: Record<string, FilterDisableRule> = {
  // Sector filter configuration
  [HowToFilterType.SECTOR]: {
    filterType: HowToFilterType.SECTOR,
    disableIfNoViableChain: true, // Disable sectors that don't lead to build types
    // Example: Disable "Building & Construction" sector
    // disabledIds: ['67e099ce75972615c9567021'],
    // Example: Always enable "Resources" sec/tor (overrides other rules)
    // enabledIds: ['67e099ab75972615c956701f'],
  },

  // Subsector filter configuration
  [HowToFilterType.SUBSECTOR]: {
    filterType: HowToFilterType.SUBSECTOR,
    disableIfNoViableChain: true, // Disable subsectors that don't lead to build types
    // Disable the entire subsector filter if no sector is selected or if there are no subsectors
    disableCondition: (filters, options) => !filters.sector || options.length === 0,
  },

  // Build Type filter configuration
  [HowToFilterType.BUILD_TYPE]: {
    filterType: HowToFilterType.BUILD_TYPE,
    // Disable the entire build type filter based on complex conditions
    disableCondition: (filters, options, ...args) => {
      const hasSubsectors = args[0];
      const subsectorOptions = args[1];
      return (
        !filters.sector ||
        (hasSubsectors && !filters.subsector && subsectorOptions.length > 0) ||
        options.length === 0
      );
    },
  },
};

export default filterConfig;
