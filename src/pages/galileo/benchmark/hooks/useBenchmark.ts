import { useCallback } from 'react';
import { useBenchmarkStore } from '../store';

export const useBenchmark = () => {
  const {
    // State
    filterOptions,
    activeFilters,
    tableData,
    isLoading,
    isDownloading,
    error,
    hasAppliedFilters,
    deselectedProjectIds,
    selectedProjectIds,
    isAllSelected,
    currentView,
    showChartsWithoutFilters,

    // Actions
    setActiveFilters,
    clearFilters,
    applyFilters,
    downloadFilteredData,
    toggleProjectSelection,
    isProjectSelected,
    resetSelection,
    setSelectAll,
    setCurrentView,
    setShowChartsWithoutFilters,
  } = useBenchmarkStore();

  // Memoized action to apply filters with debouncing
  const applyFiltersDebounced = useCallback(
    async (page?: number) => {
      return applyFilters(page);
    },
    [applyFilters]
  );

  // Memoized action to toggle project selection
  const toggleProjectSelectionHandler = useCallback(
    (projectId: string, selected: boolean) => {
      toggleProjectSelection(projectId, selected);
    },
    [toggleProjectSelection]
  );

  // Memoized action to check if a project is selected
  const isProjectSelectedHandler = useCallback(
    (projectId: string) => {
      return isProjectSelected(projectId);
    },
    [isProjectSelected]
  );

  return {
    // State
    filterOptions,
    activeFilters,
    tableData,
    isLoading,
    isDownloading,
    error,
    hasAppliedFilters,
    deselectedProjectIds,
    selectedProjectIds,
    isAllSelected,
    currentView,
    showChartsWithoutFilters,

    // Actions
    setActiveFilters,
    clearFilters,
    applyFilters: applyFiltersDebounced,
    downloadFilteredData,
    toggleProjectSelection: toggleProjectSelectionHandler,
    isProjectSelected: isProjectSelectedHandler,
    resetSelection,
    setSelectAll,
    setCurrentView,
    setShowChartsWithoutFilters,
  };
};

export default useBenchmark;
