import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ActiveFilters, FilterOptions } from '../filters';
import { filterApi } from '../filterApi';
import { FILTER_STORAGE_KEY, INITIAL_FILTER_OPTIONS } from '../constants';

// Types
export type ViewType = 'table' | 'chart';

export interface TableData {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BenchmarkState {
  // State
  filterOptions: FilterOptions | null;
  activeFilters: ActiveFilters;
  tableData: TableData | null;
  isLoading: boolean;
  isDownloading: boolean;
  error: Error | null;
  hasAppliedFilters: boolean;
  deselectedProjectIds: string[];
  currentView: ViewType;
  showChartsWithoutFilters: boolean;
  
  // Actions
  setActiveFilters: (filters: ActiveFilters) => void;
  clearFilters: () => void;
  applyFilters: (page?: number) => Promise<TableData>;
  downloadFilteredData: () => Promise<void>;
  toggleProjectSelection: (projectId: string, selected: boolean) => void;
  isProjectSelected: (projectId: string) => boolean;
  resetSelection: () => void;
  setCurrentView: (view: ViewType) => void;
  setShowChartsWithoutFilters: (show: boolean) => void;
  initializeFromURL: (urlFilters: ActiveFilters, urlDeselected: string[], view?: ViewType) => Promise<void>;
}

// Store implementation
const useBenchmarkStore = create<BenchmarkState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        filterOptions: INITIAL_FILTER_OPTIONS,
        activeFilters: {},
        tableData: null,
        isLoading: false,
        isDownloading: false,
        error: null,
        hasAppliedFilters: false,
        deselectedProjectIds: [],
        currentView: 'table',
        showChartsWithoutFilters: false,

        // Actions
        setActiveFilters: (filters) => set({ activeFilters: filters }),
        
        clearFilters: () => {
          localStorage.removeItem(FILTER_STORAGE_KEY);
          set({
            activeFilters: {},
            hasAppliedFilters: false,
            currentView: 'table',
            deselectedProjectIds: [],
          });
        },

        toggleProjectSelection: (projectId, selected) => {
          set((state) => {
            if (selected) {
              return {
                deselectedProjectIds: state.deselectedProjectIds.filter((id) => id !== projectId),
              };
            } else {
              return {
                deselectedProjectIds: state.deselectedProjectIds.includes(projectId)
                  ? state.deselectedProjectIds
                  : [...state.deselectedProjectIds, projectId],
              };
            }
          });
        },

        isProjectSelected: (projectId) => {
          return !get().deselectedProjectIds.includes(projectId);
        },

        resetSelection: () => {
          set({ deselectedProjectIds: [] });
        },

        setCurrentView: (view) => set({ currentView: view }),
        
        setShowChartsWithoutFilters: (show) => set({ showChartsWithoutFilters: show }),

        initializeFromURL: async (urlFilters, urlDeselected, view = 'table') => {
          try {
            // Set initial state from URL
            set({
              activeFilters: Object.keys(urlFilters).length > 0 ? urlFilters : {},
              deselectedProjectIds: urlDeselected || [],
              currentView: view,
              hasAppliedFilters: Object.keys(urlFilters).length > 0,
            });

            // Fetch filter options
            const options = await filterApi.getFilterOptions();
            if (!options.gfa) {
              options.gfa = [];
            }

            set({ filterOptions: options });

            // Apply filters if we have URL filters
            if (Object.keys(urlFilters).length > 0) {
              await get().applyFilters(1);
            }
          } catch (err) {
            console.error('Error initializing from URL:', err);
            set({ error: err as Error });
          }
        },

        applyFilters: async (page = 1) => {
          const { activeFilters: currentFilters } = get();
          
          try {
            set({ isLoading: true, error: null });

            const response = await filterApi.applyFilters({
              filters: currentFilters,
              page,
            });

            const newTableData: TableData = {
              data: response.data || [],
              total: response.total || 0,
              page: response.page || 1,
              limit: response.limit || 20,
              totalPages: response.totalPages || 1,
            };


            set({
              tableData: newTableData,
              hasAppliedFilters: true,
            });

            // Only fetch filter options if we haven't already or if the data has changed
            if (!get().filterOptions || response.data.length > 0) {
              const options = await filterApi.getFilterOptions();
              if (!options.gfa) {
                options.gfa = [];
              }
              set({ filterOptions: options });
            }

            return newTableData;
          } catch (err) {
            console.error('Error applying filters:', err);
            const errorState = { 
              error: err as Error,
              tableData: { data: [], total: 0, page: 1, limit: 20, totalPages: 1 }
            };
            set(errorState);
            return errorState.tableData;
          } finally {
            set({ isLoading: false });
          }
        },

        downloadFilteredData: async () => {
          try {
            set({ isDownloading: true });
            await filterApi.downloadFilteredData(get().activeFilters);
          } catch (err) {
            console.error('Error downloading filtered data:', err);
            set({ error: err as Error });
          } finally {
            set({ isDownloading: false });
          }
        },
      }),
      {
        name: 'benchmark-storage',
        partialize: (state) => ({
          activeFilters: state.activeFilters,
          deselectedProjectIds: state.deselectedProjectIds,
          currentView: state.currentView,
        }),
      }
    ),
    {
      name: 'BenchmarkStore',
    }
  )
);

export default useBenchmarkStore;
