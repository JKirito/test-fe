import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ActiveFilters, FilterOptions } from '../filters';
import { filterApi, DeselectedRow } from '../filterApi';
import { FILTER_STORAGE_KEY, INITIAL_FILTER_OPTIONS } from '../constants';

// Define the structure of the table data
interface TableData {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define the Project interface
export interface Project {
  _id?: string;
  projectid?: string;
  project_code?: string;
  [key: string]: any;
}

// Define the view types
export type ViewType = 'table' | 'chart';

interface BenchmarkFiltersContextValue {
  filterOptions: FilterOptions | null;
  activeFilters: ActiveFilters;
  setActiveFilters: (filters: ActiveFilters) => void;
  clearFilters: () => void;

  // Table data and pagination
  tableData: TableData | null;
  applyFilters: (page?: number) => Promise<TableData>;
  isLoading: boolean;
  error: Error | null;
  hasAppliedFilters: boolean;

  // Download functionality
  downloadFilteredData: () => Promise<void>;
  isDownloading: boolean;

  // Deselected projects tracking
  deselectedProjectIds: string[];
  toggleProjectSelection: (projectId: string, selected: boolean) => void;
  isProjectSelected: (projectId: string) => boolean;
  resetSelection: () => void;

  // View management
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Chart view without filters
  showChartsWithoutFilters: boolean;
  setShowChartsWithoutFilters: (show: boolean) => void;
}

const BenchmarkFiltersContext = createContext<BenchmarkFiltersContextValue | undefined>(undefined);

export const BenchmarkFiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL parameters if available
  const initializeFromURL = () => {
    try {
      // Get filters from URL
      const filtersParam = searchParams.get('filters');
      const filters = filtersParam ? JSON.parse(decodeURIComponent(filtersParam)) : {};

      // Get deselected projects from URL
      const deselectedParam = searchParams.get('deselected');
      const deselected = deselectedParam ? JSON.parse(decodeURIComponent(deselectedParam)) : [];

      return { filters, deselected };
    } catch (err) {
      console.error('Error parsing URL parameters:', err);
      return { filters: {}, deselected: [] };
    }
  };

  const { filters: urlFilters, deselected: urlDeselected } = initializeFromURL();

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(INITIAL_FILTER_OPTIONS);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() => {
    // Prioritize URL parameters over local storage
    if (Object.keys(urlFilters).length > 0) {
      return urlFilters;
    }

    const storedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    return storedFilters ? JSON.parse(storedFilters) : {};
  });

  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(Object.keys(urlFilters).length > 0);
  const [deselectedProjectIds, setDeselectedProjectIds] = useState<string[]>(urlDeselected);

  // View state management
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    // Check if view is specified in URL parameters
    const viewParam = searchParams.get('view');
    return viewParam === 'chart' ? 'chart' : 'table';
  });

  // State to track if charts should be shown without filters
  const [showChartsWithoutFilters, setShowChartsWithoutFilters] = useState<boolean>(false);

  // Update URL parameters function removed - now handled directly in the effect

  // Update URL when filters, deselected projects, or view changes
  // Use a ref to prevent unnecessary URL updates
  const isUpdatingURLRef = useRef(false);
  const prevURLParamsRef = useRef<string>('');

  useEffect(() => {
    // Skip if we're already updating the URL or if filters haven't been applied
    if (isUpdatingURLRef.current || !hasAppliedFilters) {
      return;
    }

    // Create new URL parameters
    const newParams = new URLSearchParams();

    // Only add filters to URL if they exist
    if (Object.keys(activeFilters).length > 0) {
      newParams.set('filters', encodeURIComponent(JSON.stringify(activeFilters)));
    }

    // Only add deselected projects to URL if they exist
    if (deselectedProjectIds.length > 0) {
      newParams.set('deselected', encodeURIComponent(JSON.stringify(deselectedProjectIds)));
    }

    // Add view parameter if it's chart view
    if (currentView === 'chart') {
      newParams.set('view', 'chart');
    }

    // Check if the URL parameters have actually changed
    const newParamsStr = newParams.toString();
    if (newParamsStr === prevURLParamsRef.current) {
      // // console.log('Skipping URL update - parameters unchanged');
      return;
    }

    // Update the previous URL parameters
    prevURLParamsRef.current = newParamsStr;

    // Set the flag to prevent recursive updates
    isUpdatingURLRef.current = true;

    // Update URL parameters
    // // console.log('Updating URL parameters:', newParamsStr);
    setSearchParams(newParams, { replace: true });

    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingURLRef.current = false;
    }, 300);
  }, [activeFilters, deselectedProjectIds, currentView, hasAppliedFilters, setSearchParams]);

  const clearFilters = () => {
    setActiveFilters({});
    localStorage.removeItem(FILTER_STORAGE_KEY);
    // Reset selection when filters are cleared
    resetSelection();
    // Reset to table view if we're in chart view
    if (currentView === 'chart') {
      setCurrentView('table');
    }
    // Reset hasAppliedFilters to show the initial view
    setHasAppliedFilters(false);
    // Clear URL parameters
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Toggle project selection (true = selected, false = deselected)
  const toggleProjectSelection = (projectId: string, selected: boolean) => {
    if (selected) {
      // If selected, remove from deselected list
      setDeselectedProjectIds((prev) => prev.filter((id) => id !== projectId));
    } else {
      // If deselected, add to deselected list (if not already there)
      setDeselectedProjectIds((prev) => {
        if (prev.includes(projectId)) return prev;
        return [...prev, projectId];
      });
    }
  };

  // Check if a project is selected
  const isProjectSelected = (projectId: string): boolean => {
    return !deselectedProjectIds.includes(projectId);
  };

  // Reset selection (all projects selected)
  const resetSelection = () => {
    setDeselectedProjectIds([]);
  };

  // Function to toggle between table and chart view
  const toggleView = () => {
    setCurrentView(currentView === 'table' ? 'chart' : 'table');
  };

  // Track the last applied filters to prevent duplicate API calls
  const lastAppliedFiltersRef = useRef<string>('');

  // Function to download filtered data
  const downloadFilteredData = async (): Promise<void> => {
    try {
      setIsDownloading(true);
      await filterApi.downloadFilteredData(activeFilters);
    } catch (err) {
      setError(err as Error);
      console.error('Error downloading filtered data:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const applyFilters = async (page?: number): Promise<TableData> => {
    try {
      // Check if we're trying to apply the same filters again
      const currentFiltersStr = JSON.stringify(activeFilters);

      // Determine the requested page (default to 1 when not provided)
      const requestedPage = page || 1;

      // Skip fetching if filters are unchanged *and* we're already on the requested page
      if (
        currentFiltersStr === lastAppliedFiltersRef.current &&
        tableData &&
        tableData.page === requestedPage
      ) {
        // // console.log('Skipping duplicate filter application');
        return tableData;
      }

      // Update the last applied filters reference
      lastAppliedFiltersRef.current = currentFiltersStr;

      setIsLoading(true);
      setError(null);

      // Always fetch data, even if no filters are applied
      // This allows viewing all data when the user clicks "View Data" without applying filters
      const response = await filterApi.applyFilters({
        filters: activeFilters,
        page: page || 1,
      });

      // Log the response structure to debug
      // // console.log('Filter API response:', response);

      // Store the table data
      const newTableData: TableData = {
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: response.totalPages || 1,
      };

      setTableData(newTableData);

      // Only fetch filter options if we haven't already or if the data has changed
      if (!filterOptions || response.data.length > 0) {
        // The response from applyFilters doesn't include filter options
        // We need to fetch them again to maintain the sidebar filters
        const options = await filterApi.getFilterOptions();

        // Ensure GFA filter is always available
        if (!options.gfa) {
          options.gfa = [];
        }

        setFilterOptions(options);
      }

      // Only set hasAppliedFilters to true if it's not already true
      // This prevents unnecessary state updates that could trigger effects
      if (!hasAppliedFilters) {
        setHasAppliedFilters(true);
      }

      // URL parameters will be updated by the effect that watches for filter changes
      // No need to call updateURLParams() here

      return newTableData;
    } catch (err) {
      setError(err as Error);
      console.error('Error applying filters:', err);
      // Return empty table data on error
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Use a ref to track if we've already initialized from URL
  const hasInitializedFromURLRef = useRef(false);

  useEffect(() => {
    // Skip if we've already initialized from URL
    if (hasInitializedFromURLRef.current) {
      return;
    }

    // Mark that we're initializing from URL
    hasInitializedFromURLRef.current = true;

    const fetchFilterOptions = async () => {
      try {
        const options = await filterApi.getFilterOptions();

        // Ensure GFA filter is always available
        if (!options.gfa) {
          options.gfa = [];
        }

        setFilterOptions(options);

        // If we have URL filters, apply them automatically AFTER filter options are loaded
        if (Object.keys(urlFilters).length > 0) {
          // // console.log('Applying filters from URL parameters:', urlFilters);

          // Set a flag to prevent URL updates during initialization
          isUpdatingURLRef.current = true;

          // Apply the filters
          await applyFilters(1);

          // Update the previous URL parameters ref to prevent unnecessary updates
          const newParams = new URLSearchParams();
          if (Object.keys(urlFilters).length > 0) {
            newParams.set('filters', encodeURIComponent(JSON.stringify(urlFilters)));
          }
          if (urlDeselected.length > 0) {
            newParams.set('deselected', encodeURIComponent(JSON.stringify(urlDeselected)));
          }
          prevURLParamsRef.current = newParams.toString();

          // Reset the flag after a delay
          setTimeout(() => {
            isUpdatingURLRef.current = false;
            // // console.log('Initialization from URL complete, URL updates enabled');
          }, 500);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilterOptions();

    // Otherwise, don't fetch data on initialization
    // We'll only fetch data when the user applies filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BenchmarkFiltersContext.Provider
      value={{
        filterOptions,
        activeFilters,
        setActiveFilters,
        clearFilters,
        tableData,
        applyFilters,
        isLoading,
        error,
        hasAppliedFilters,
        downloadFilteredData,
        isDownloading,
        deselectedProjectIds,
        toggleProjectSelection,
        isProjectSelected,
        resetSelection,
        currentView,
        setCurrentView,
        showChartsWithoutFilters,
        setShowChartsWithoutFilters,
      }}
    >
      {children}
    </BenchmarkFiltersContext.Provider>
  );
};

export const useBenchmarkFilters = () => {
  const context = useContext(BenchmarkFiltersContext);
  if (!context) {
    throw new Error('useBenchmarkFilters must be used within a BenchmarkFiltersProvider');
  }
  return context;
};
