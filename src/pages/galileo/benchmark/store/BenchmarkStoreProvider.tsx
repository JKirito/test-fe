import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import useBenchmarkStore, { ViewType } from './useBenchmarkStore';

interface BenchmarkStoreProviderProps {
  children: React.ReactNode;
}

const BenchmarkStoreProvider: React.FC<BenchmarkStoreProviderProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isInitializedRef = useRef(false);
  const isUpdatingURLRef = useRef(false);
  const prevURLParamsRef = useRef<string>('');

  // Get store actions
  const { initializeFromURL, activeFilters, deselectedProjectIds, currentView, hasAppliedFilters } =
    useBenchmarkStore();

  // Initialize from URL on mount
  useEffect(() => {
    if (isInitializedRef.current) return;

    try {
      // Get filters from URL
      const filtersParam = searchParams.get('filters');
      const filters = filtersParam ? JSON.parse(decodeURIComponent(filtersParam)) : {};

      // Get deselected projects from URL
      const deselectedParam = searchParams.get('deselected');
      const deselected = deselectedParam ? JSON.parse(decodeURIComponent(deselectedParam)) : [];

      // Get view from URL
      const viewParam = searchParams.get('view');
      const view: ViewType = viewParam === 'chart' ? 'chart' : 'table';

      // Initialize store with URL data
      initializeFromURL(filters, deselected, view);
      isInitializedRef.current = true;
    } catch (err) {
      console.error('Error initializing from URL:', err);
      // Initialize with empty state if there's an error
      initializeFromURL({}, [], 'table');
      isInitializedRef.current = true;
    }
  }, [searchParams, initializeFromURL]);

  // Update URL when relevant state changes
  useEffect(() => {
    // Skip if we're already updating the URL or if we haven't initialized yet
    if (isUpdatingURLRef.current || !isInitializedRef.current || !hasAppliedFilters) {
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
      return;
    }

    // Update the previous URL parameters
    prevURLParamsRef.current = newParamsStr;

    // Set the flag to prevent recursive updates
    isUpdatingURLRef.current = true;

    // Update URL parameters
    const newSearch = newParams.toString();
    const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    window.history.replaceState({}, '', newPath);

    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingURLRef.current = false;
    }, 300);
  }, [activeFilters, deselectedProjectIds, currentView, hasAppliedFilters, location.pathname]);

  return <>{children}</>;
};

export default BenchmarkStoreProvider;
