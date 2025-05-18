# How To Admin Filter Configuration

This directory contains configuration files for the How To Admin section of the Einstein application.

## Filter Configuration

The `filterConfig.ts` file provides a centralized way to control how filters are disabled in the How To Admin section.

### Configuration Options

For each filter type (sector, subsector, buildType), you can configure:

1. **disabledIds**: An array of specific filter option IDs that should always be disabled
2. **enabledIds**: An array of specific filter option IDs that should always be enabled (overrides other disable rules)
3. **disableIfNoViableChain**: Whether to disable options that don't lead to any build types
4. **disableCondition**: A function that determines whether the entire filter group should be disabled

### Example Configuration

```typescript
// Sector filter configuration
[HowToFilterType.SECTOR]: {
  filterType: HowToFilterType.SECTOR,
  disableIfNoViableChain: true, // Disable sectors that don't lead to build types
  disabledIds: ['sector-id-1', 'sector-id-2'], // Specific IDs to disable
},

// Subsector filter configuration
[HowToFilterType.SUBSECTOR]: {
  filterType: HowToFilterType.SUBSECTOR,
  disableIfNoViableChain: true,
  // Disable the entire subsector filter if no sector is selected
  disableCondition: (filters, options) => !filters.sector || options.length === 0,
},
```

### How to Use

To disable specific filter options:

1. Find the ID of the filter option you want to disable
2. Add the ID to the `disabledIds` array in the appropriate filter type configuration

```typescript
[HowToFilterType.SECTOR]: {
  filterType: HowToFilterType.SECTOR,
  disabledIds: ['67e099ce75972615c9567021'], // Disable "Building & Construction" sector
},
```

To always enable specific filter options (override other disable rules):

```typescript
[HowToFilterType.SECTOR]: {
  filterType: HowToFilterType.SECTOR,
  disableIfNoViableChain: true,
  enabledIds: ['67e099ab75972615c956701f'], // Always enable "Resources" sector
},
```

### Custom Disable Conditions

You can create custom logic to determine when an entire filter group should be disabled:

```typescript
[HowToFilterType.BUILD_TYPE]: {
  filterType: HowToFilterType.BUILD_TYPE,
  disableCondition: (filters, options, ...args) => {
    const hasSubsectors = args[0];
    const subsectorOptions = args[1];
    
    // Custom logic to determine if the filter should be disabled
    return !filters.sector || 
           (hasSubsectors && !filters.subsector && subsectorOptions.length > 0) ||
           options.length === 0;
  },
},
```
