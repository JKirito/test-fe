import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  FilterOptions,
  ActiveFilters,
  ApplyFiltersParams,
} from '@/pages/galileo/benchmark/filters';
import { filterApi } from '@/pages/galileo/benchmark/filterApi';
import { INITIAL_FILTER_OPTIONS } from '@/pages/galileo/benchmark/constants';

export type ViewType = 'table' | 'chart';

export interface TableData {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BenchmarkState {
  filterOptions: FilterOptions | null;
  activeFilters: ActiveFilters;
  tableData: TableData | null;
  isLoading: boolean;
  isDownloading: boolean;
  error: string | null;
  hasAppliedFilters: boolean;
  deselectedProjectIds: string[];
  selectedProjectIds: string[];
  isAllSelected: boolean;
  currentView: ViewType;
  showChartsWithoutFilters: boolean;
}

const storedFilters = localStorage.getItem('galileoBenchmarkActiveFilters');

const initialState: BenchmarkState = {
  filterOptions: INITIAL_FILTER_OPTIONS,
  activeFilters: storedFilters ? JSON.parse(storedFilters) : {},
  tableData: null,
  isLoading: false,
  isDownloading: false,
  error: null,
  hasAppliedFilters: false,
  deselectedProjectIds: [],
  selectedProjectIds: [],
  isAllSelected: true,
  currentView: 'table',
  showChartsWithoutFilters: false,
};

export const applyFilters = createAsyncThunk(
  'benchmark/applyFilters',
  async (params: ApplyFiltersParams) => {
    const response = await filterApi.applyFilters(params);
    return response;
  }
);

export const fetchFilterOptions = createAsyncThunk('benchmark/fetchFilterOptions', async () => {
  const options = await filterApi.getFilterOptions();
  if (!options.gfa) {
    options.gfa = [];
  }
  return options;
});

export const downloadFilteredData = createAsyncThunk(
  'benchmark/downloadFilteredData',
  async (filters: ActiveFilters) => {
    await filterApi.downloadFilteredData(filters);
  }
);

const benchmarkSlice = createSlice({
  name: 'benchmark',
  initialState,
  reducers: {
    setActiveFilters(state, action: PayloadAction<ActiveFilters>) {
      state.activeFilters = action.payload;
      localStorage.setItem('galileoBenchmarkActiveFilters', JSON.stringify(action.payload));
    },
    clearFilters(state) {
      state.activeFilters = {};
      state.hasAppliedFilters = false;
      state.deselectedProjectIds = [];
      state.selectedProjectIds = [];
      state.isAllSelected = true;
      state.currentView = 'table';
      localStorage.removeItem('galileoBenchmarkActiveFilters');
    },
    toggleProjectSelection(state, action: PayloadAction<{ projectId: string; selected: boolean }>) {
      const { projectId, selected } = action.payload;
      if (state.isAllSelected) {
        if (selected) {
          state.deselectedProjectIds = state.deselectedProjectIds.filter((id) => id !== projectId);
        } else if (!state.deselectedProjectIds.includes(projectId)) {
          state.deselectedProjectIds.push(projectId);
        }
      } else {
        if (selected) {
          if (!state.selectedProjectIds.includes(projectId)) {
            state.selectedProjectIds.push(projectId);
          }
        } else {
          state.selectedProjectIds = state.selectedProjectIds.filter((id) => id !== projectId);
        }
      }
    },
    resetSelection(state) {
      state.deselectedProjectIds = [];
      state.selectedProjectIds = [];
      state.isAllSelected = true;
    },
    setSelectAll(state, action: PayloadAction<boolean>) {
      state.isAllSelected = action.payload;
      state.deselectedProjectIds = [];
      state.selectedProjectIds = [];
    },
    setCurrentView(state, action: PayloadAction<ViewType>) {
      state.currentView = action.payload;
    },
    setShowChartsWithoutFilters(state, action: PayloadAction<boolean>) {
      state.showChartsWithoutFilters = action.payload;
    },
    setHasAppliedFilters(state, action: PayloadAction<boolean>) {
      state.hasAppliedFilters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyFilters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyFilters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tableData = {
          data: action.payload.data || [],
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          totalPages: action.payload.totalPages || 1,
        };
        state.hasAppliedFilters = true;
      })
      .addCase(applyFilters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error applying filters';
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.filterOptions = action.payload;
      })
      .addCase(downloadFilteredData.pending, (state) => {
        state.isDownloading = true;
      })
      .addCase(downloadFilteredData.fulfilled, (state) => {
        state.isDownloading = false;
      })
      .addCase(downloadFilteredData.rejected, (state) => {
        state.isDownloading = false;
      });
  },
});

export const {
  setActiveFilters,
  clearFilters,
  toggleProjectSelection,
  resetSelection,
  setSelectAll,
  setCurrentView,
  setShowChartsWithoutFilters,
  setHasAppliedFilters,
} = benchmarkSlice.actions;

export default benchmarkSlice.reducer;
