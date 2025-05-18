import React, { useState, useEffect } from 'react';
import styles from './Filter.module.scss';
import { SEARCH_SOURCES } from '../../config/searchSources';
// Import the new FilterMultiSelect component
import FilterMultiSelect from '../FilterMultiSelect/FilterMultiSelect';

// Define the possible filter types
export type FilterType = 'all' | 'sharepoint' | 'citrixAll' | 'citrixSpecific';

// Define the structure for the filter state
export interface FilterState {
  type: FilterType;
  specificDrives?: string[]; // Holds the list of filterIds for selected drives
}

interface FilterProps {
  initialFilter?: FilterState;
  onChange: (filterState: FilterState) => void;
}

// Get Citrix drive configurations from the main config
const CITRIX_DRIVE_CONFIGS = SEARCH_SOURCES.filter((source) => source.type === 'citrix');
// Get just the filter IDs for all Citrix drives
const ALL_CITRIX_FILTER_IDS = CITRIX_DRIVE_CONFIGS.map((drive) => drive.filterId);
// Format options for the MultiSelectTag component
const CITRIX_DRIVE_OPTIONS_FOR_SELECT = CITRIX_DRIVE_CONFIGS.map((drive) => ({
  value: drive.filterId,
  label: drive.displayName,
}));

const Filter: React.FC<FilterProps> = ({ initialFilter = { type: 'all' }, onChange }) => {
  const [selectedType, setSelectedType] = useState<FilterType>(initialFilter.type);
  // This state now tracks the selection within the MultiSelectTag UI
  const [selectedDriveIds, setSelectedDriveIds] = useState<string[]>(() => {
    // Initialize with all drives if initial type is citrixSpecific, otherwise empty
    return initialFilter.type === 'citrixSpecific'
      ? initialFilter.specificDrives || ALL_CITRIX_FILTER_IDS
      : [];
  });

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as FilterType;
    setSelectedType(newType);

    let newSpecificDrives: string[] = [];

    if (newType === 'citrixSpecific') {
      // When switching *to* specific, default to all drives selected
      newSpecificDrives = ALL_CITRIX_FILTER_IDS;
      setSelectedDriveIds(newSpecificDrives); // Update local UI state
    } else {
      // When switching *away* from specific, clear local drive selection
      setSelectedDriveIds([]);
    }

    // Inform parent immediately about the type change and the corresponding drive selection
    onChange({ type: newType, specificDrives: newSpecificDrives });
  };

  // This function handles changes *within* the MultiSelectTag
  const handleDriveSelectionChange = (newSelectedIds: string[]) => {
    setSelectedDriveIds(newSelectedIds); // Update local UI state
    // Inform parent about the specific drive selection change
    onChange({ type: 'citrixSpecific', specificDrives: newSelectedIds });
  };

  // Effect to sync selectedDriveIds if initialFilter changes externally
  // This might be needed if the parent component can reset the filter
  useEffect(() => {
    if (initialFilter.type === 'citrixSpecific') {
      setSelectedDriveIds(initialFilter.specificDrives || ALL_CITRIX_FILTER_IDS);
    } else {
      setSelectedDriveIds([]);
    }
    setSelectedType(initialFilter.type);
  }, [initialFilter]);

  return (
    <div className={styles.filterContainer}>
      <h4 className={styles.filterTitle}>Filter by Source:</h4>
      <div className={styles.radioGroup}>
        <label>
          <input
            type="radio"
            name="filterType"
            value="all"
            checked={selectedType === 'all'}
            onChange={handleTypeChange}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            name="filterType"
            value="sharepoint"
            checked={selectedType === 'sharepoint'}
            onChange={handleTypeChange}
          />
          Only SharePoint
        </label>
        <label>
          <input
            type="radio"
            name="filterType"
            value="citrixAll"
            checked={selectedType === 'citrixAll'}
            onChange={handleTypeChange}
          />
          All Citrix Drives
        </label>
        <label>
          <input
            type="radio"
            name="filterType"
            value="citrixSpecific"
            checked={selectedType === 'citrixSpecific'}
            onChange={handleTypeChange}
          />
          Specific Citrix Drives
        </label>
      </div>

      {selectedType === 'citrixSpecific' && (
        <div className={styles.dropdownContainer}>
          <FilterMultiSelect
            label="Select Drives"
            options={CITRIX_DRIVE_OPTIONS_FOR_SELECT}
            selectedValues={selectedDriveIds}
            onChange={handleDriveSelectionChange}
          />
        </div>
      )}
    </div>
  );
};

export default Filter;
