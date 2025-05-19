import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/store';
import {
  ActiveFilters,
  FilterOptions,
} from '../filters';
import {
  applyFilters,
  fetchFilterOptions,
  downloadFilteredData,
  setActiveFilters,
  clearFilters,
  toggleProjectSelection,
  resetSelection,
  setCurrentView,
  setShowChartsWithoutFilters,
  setHasAppliedFilters,
  ViewType,
} from '@/lib/store/features/galileo/benchmarkSlice';

export const useBenchmarkStore = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.benchmark);

  const initializeFromURL = useCallback(
    async (
      urlFilters: ActiveFilters,
      urlDeselected: string[],
      view: ViewType = 'table'
    ) => {
      dispatch(setActiveFilters(Object.keys(urlFilters).length > 0 ? urlFilters : {}));
      dispatch(setCurrentView(view));
      dispatch(setHasAppliedFilters(Object.keys(urlFilters).length > 0));
      if (urlDeselected && urlDeselected.length > 0) {
        urlDeselected.forEach((id) =>
          dispatch(toggleProjectSelection({ projectId: id, selected: false }))
        );
      }
      await dispatch(fetchFilterOptions()).unwrap();
      if (Object.keys(urlFilters).length > 0) {
        await dispatch(applyFilters({ filters: urlFilters, page: 1 })).unwrap();
      }
    },
    [dispatch]
  );

  const applyFiltersAction = useCallback(
    async (page?: number) => {
      return dispatch(applyFilters({ filters: state.activeFilters, page: page || 1 })).unwrap();
    },
    [dispatch, state.activeFilters]
  );

  const downloadFilteredDataAction = useCallback(async () => {
    await dispatch(downloadFilteredData(state.activeFilters));
  }, [dispatch, state.activeFilters]);

  const toggleProjectSelectionAction = useCallback(
    (projectId: string, selected: boolean) => {
      dispatch(toggleProjectSelection({ projectId, selected }));
    },
    [dispatch]
  );

  const isProjectSelected = useCallback(
    (projectId: string) => !state.deselectedProjectIds.includes(projectId),
    [state.deselectedProjectIds]
  );

  return {
    ...state,
    setActiveFilters: (filters: ActiveFilters) => dispatch(setActiveFilters(filters)),
    clearFilters: () => dispatch(clearFilters()),
    applyFilters: applyFiltersAction,
    downloadFilteredData: downloadFilteredDataAction,
    toggleProjectSelection: toggleProjectSelectionAction,
    isProjectSelected,
    resetSelection: () => dispatch(resetSelection()),
    setCurrentView: (view: ViewType) => dispatch(setCurrentView(view)),
    setShowChartsWithoutFilters: (show: boolean) => dispatch(setShowChartsWithoutFilters(show)),
    initializeFromURL,
  };
};

export type { ViewType, FilterOptions } from '../filters';
export type { TableData } from '@/lib/store/features/galileo/benchmarkSlice';

export default useBenchmarkStore;
