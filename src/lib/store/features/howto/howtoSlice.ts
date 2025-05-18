import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/config/axiosConfig';
import { RootState } from '../../store';

// Import types from the admin feature area
import {
  HowToFilterOption,
  GroupedFilterOptions,
  FilterRelationship,
  HowToWithChildren, // Import the enum if needed for comparisons/logic
} from '@/einstein/components/admin/howTo/types/howTo.types.ts';

// Keep SelectedFilters as it seems specific to the slice's state handling
export interface SelectedFilters {
  sector?: string;
  subsector?: string;
  buildType?: string;
  // lifecycle removed
}

export interface HowToState {
  howTos: HowToWithChildren[]; // Use imported type
  filterOptions: GroupedFilterOptions | null;
  filterRelationships: Record<string, FilterRelationship>;
  selectedFilters: SelectedFilters;
  isLoading: boolean;
  selectedHowTo: HowToWithChildren | null; // Use imported type
  hasAppliedFilters: boolean;
  error: string | null;
}

// Initial state
const initialState: HowToState = {
  howTos: [],
  filterOptions: null,
  filterRelationships: {},
  selectedFilters: {},
  isLoading: false,
  selectedHowTo: null,
  hasAppliedFilters: false,
  error: null,
};

// Async thunks
export const fetchFilterOptions = createAsyncThunk(
  'howto/fetchFilterOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/how-to/filter-hierarchy/tree');
      const treeData = response.data.data as HowToFilterOption[];

      // Process the tree data to organize by filter types
      const groupedFilters: GroupedFilterOptions = {
        sectors: [],
        subsectors: [],
        buildTypes: [],
        // lifecycles removed
      };

      // Track relationships between filters
      const relationships: Record<string, FilterRelationship> = {};

      // Ensure unique values for each filter option
      const ensureUniqueValue = (filter: HowToFilterOption): HowToFilterOption => {
        // If value is missing or doesn't match label, set value to label
        if (!filter.value || filter.value !== filter.label) {
          filter.value = filter.label;
        }

        // Recursively ensure unique values for children
        if (filter.children && filter.children.length > 0) {
          filter.children = filter.children.map(ensureUniqueValue);
        }

        return filter;
      };

      // Process tree data to ensure unique values
      const uniqueValueTreeData = treeData.map(ensureUniqueValue);

      // Flatten and organize the tree structure
      const processFilters = (filters: HowToFilterOption[]) => {
        filters.forEach((filter) => {
          // Add to appropriate group based on filterType
          switch (filter.filterType as string) {
            case 'sector':
              groupedFilters.sectors.push({ ...filter });
              break;
            case 'subsector':
              groupedFilters.subsectors.push({ ...filter });
              break;
            case 'buildType':
              groupedFilters.buildTypes.push({ ...filter });
              break;
            // lifecycle case removed
          }

          // Track relationships
          relationships[filter._id] = {
            id: filter._id,
            parentId: filter.parentId || null,
            children: filter.children?.map((child) => child._id) || [],
            filterType: filter.filterType, // This now expects HowToFilterType enum
          };

          // Process children recursively
          if (filter.children && filter.children.length > 0) {
            processFilters(filter.children);
          }
        });
      };

      processFilters(uniqueValueTreeData);

      return {
        groupedFilters,
        relationships,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch filter options');
    }
  }
);

export const fetchHowTos = createAsyncThunk<
  HowToWithChildren[], // Return type is now HowToWithChildren[]
  SelectedFilters, // Argument type
  { rejectWithValue: (value: string) => any; state: RootState } // Thunk config
>('howto/fetchHowTos', async (filters, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState;
    const filterOptions = state.howto.filterOptions;

    if (!filterOptions) {
      return rejectWithValue('Filter options not loaded');
    }

    const params = new URLSearchParams();

    // Add selected filters to params if they exist - pass object IDs instead of values
    if (filters.sector) {
      // Pass the sector ID directly
      params.append('sector', filters.sector);
    }

    if (filters.subsector) {
      // Pass the subsector ID directly
      params.append('subsector', filters.subsector);
    }

    if (filters.buildType) {
      // Pass the buildType ID directly
      params.append('buildType', filters.buildType);
    }

    // lifecycle filter handling removed

    // The API now expects object IDs instead of text values
    const response = await apiClient.get(`/how-to/filtered-hierarchy?${params.toString()}`);
    return response.data.data as HowToWithChildren[];
  } catch (error) {
    console.error('Error fetching how-tos:', error);
    return rejectWithValue('Failed to fetch how-to content');
  }
});

export const fetchSasUrl = createAsyncThunk(
  'howto/fetchSasUrl',
  async (url: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/how-to/files/url`, {
        params: { url },
      });

      if (response.data && response.data.data && response.data.data.sasUrl) {
        return response.data.data.sasUrl as string;
      }

      throw new Error('Invalid response format from API');
    } catch (error) {
      return rejectWithValue('Failed to fetch SAS URL');
    }
  }
);

// Slice
const howtoSlice = createSlice({
  name: 'howto',
  initialState,
  reducers: {
    setSelectedFilters: (state, action: PayloadAction<SelectedFilters>) => {
      state.selectedFilters = action.payload;
      // Determine if essential filters are applied
      state.hasAppliedFilters = !!(
        action.payload.sector &&
        action.payload.buildType
        // lifecycle removed
      );
      // Reset selected HowTo when filters change
      state.selectedHowTo = null;
      // Potentially reset howTos data if filters are incomplete
      if (!state.hasAppliedFilters) {
        state.howTos = [];
      }
    },
    setSelectedHowTo: (state, action: PayloadAction<HowToWithChildren | null>) => {
      state.selectedHowTo = action.payload;
    },
    resetHowToState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Filter options
      .addCase(fetchFilterOptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filterOptions = action.payload.groupedFilters;
        state.filterRelationships = action.payload.relationships;
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // HowTo items
      .addCase(fetchHowTos.pending, (state) => {
        // Only set loading true if filters are already applied
        if (state.hasAppliedFilters) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addCase(fetchHowTos.fulfilled, (state, action: PayloadAction<HowToWithChildren[]>) => {
        // Ensure loading is only set false if it was true for this fetch
        if (state.isLoading) {
          state.isLoading = false;
        }
        state.howTos = action.payload;
        // Automatically select the first item if none is selected and data exists
        if (!state.selectedHowTo && state.howTos.length > 0) {
          // state.selectedHowTo = state.howTos[0]; // Decide if this behaviour is desired
        }
      })
      .addCase(fetchHowTos.rejected, (state, action) => {
        if (state.isLoading) {
          state.isLoading = false;
        }
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { setSelectedFilters, setSelectedHowTo, resetHowToState } = howtoSlice.actions;

// Selectors
export const selectHowToState = (state: RootState) => state.howto;
export const selectFilterOptions = (state: RootState) => state.howto.filterOptions;
export const selectFilterRelationships = (state: RootState) => state.howto.filterRelationships;
export const selectSelectedFilters = (state: RootState) => state.howto.selectedFilters;
export const selectHowTos = (state: RootState): HowToWithChildren[] => state.howto.howTos;
export const selectSelectedHowTo = (state: RootState): HowToWithChildren | null =>
  state.howto.selectedHowTo;
export const selectIsLoading = (state: RootState) => state.howto.isLoading;
export const selectHasAppliedFilters = (state: RootState) => state.howto.hasAppliedFilters;
export const selectError = (state: RootState) => state.howto.error;

// Helper selectors
export const selectFiltersByParent = (state: RootState, parentId: string | null) => {
  const relationships = state.howto.filterRelationships;
  const options = state.howto.filterOptions;

  if (!options) return [];

  // Find all filters that have this parent
  const childIds = Object.values(relationships)
    .filter((rel) => rel.parentId === parentId)
    .map((rel) => rel.id);

  // Get the actual filter objects from their respective arrays
  const childFilters: HowToFilterOption[] = [];

  childIds.forEach((id) => {
    // Check each filter type array for the ID
    const sector = options.sectors.find((f) => f._id === id);
    if (sector) {
      childFilters.push(sector);
      return;
    }

    const subsector = options.subsectors.find((f) => f._id === id);
    if (subsector) {
      childFilters.push(subsector);
      return;
    }

    const buildType = options.buildTypes.find((f) => f._id === id);
    if (buildType) {
      childFilters.push(buildType);
      return;
    }

    // lifecycle check removed
  });

  return childFilters;
};

// Helper to get safe select options ensuring unique keys
export const getSelectOptions = (options: HowToFilterOption[]) => {
  return options.map((option) => ({
    label: option.label,
    value: option._id, // Use _id instead of value to ensure uniqueness
    original: option,
  }));
};

export const selectChildrenByType = (
  state: RootState,
  parentId: string | null,
  filterType: string
) => {
  const relationships = state.howto.filterRelationships;
  const options = state.howto.filterOptions;

  if (!options) return [];

  // Find all filters that have this parent and match the filter type
  const childIds = Object.values(relationships)
    .filter((rel) => rel.parentId === parentId && rel.filterType === filterType)
    .map((rel) => rel.id);

  // Get the corresponding filter objects
  let filterArray: HowToFilterOption[] = [];

  switch (filterType) {
    case 'sector':
      filterArray = options.sectors;
      break;
    case 'subsector':
      filterArray = options.subsectors;
      break;
    case 'buildType':
      filterArray = options.buildTypes;
      break;
    // lifecycle case removed
  }

  return filterArray.filter((filter) => childIds.includes(filter._id));
};

export default howtoSlice.reducer;
