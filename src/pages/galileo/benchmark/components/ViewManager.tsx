import React, { useRef } from 'react';
import { useBenchmarkFilters } from '../context/BenchmarkFiltersContext';
import BenchmarkTable from './BenchmarkTable';
import MicroChartView from './MicroChartView';
import InitialChartView from './InitialChartView';

/**
 * ViewManager component that handles displaying the appropriate view based on the application state
 * 1. Initial view with donut chart showing all projects by sector
 * 2. Table view with applied filters and selected/deselected projects
 * 3. Chart view showing visualizations based on filters and selected projects
 */
const ViewManager: React.FC = () => {
  const { hasAppliedFilters, tableData, isLoading, currentView, showChartsWithoutFilters } =
    useBenchmarkFilters();

  // Log the current state for debugging - but only when it changes
  const prevStateRef = useRef({
    hasAppliedFilters,
    currentView,
    showChartsWithoutFilters,
    isLoading,
    hasTableData: !!tableData?.data?.length,
  });

  // Only log when state actually changes to reduce console spam
  const currentState = {
    hasAppliedFilters,
    currentView,
    showChartsWithoutFilters,
    isLoading,
    hasTableData: !!tableData?.data?.length,
  };

  if (JSON.stringify(prevStateRef.current) !== JSON.stringify(currentState)) {
    // // console.log('ViewManager state:', currentState);
    prevStateRef.current = currentState;
  }

  // If filters haven't been applied yet and we're not showing charts without filters, show the initial chart view
  if (!hasAppliedFilters && !showChartsWithoutFilters) {
    return <InitialChartView />;
  }

  // If filters have been applied but we're still loading, show a loading state
  if (isLoading) {
    return (
      <div
        className="view-manager__loading"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          backgroundColor: 'var(--e-grayscale-50)',
          borderRadius: 'var(--e-br-8)',
          margin: 'var(--e-sp-16)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="e-loader" style={{ margin: '0 auto', marginBottom: '16px' }}></div>
          <p style={{ fontSize: '16px', color: 'var(--e-grayscale-600)' }}>Loading data...</p>
        </div>
      </div>
    );
  }

  // Show the appropriate view based on the current view and whether we're showing charts without filters
  if (currentView === 'chart' && (hasAppliedFilters || showChartsWithoutFilters)) {
    // Show charts if we're in chart view and either have applied filters or explicitly want to show charts without filters
    return <MicroChartView />;
  } else if (currentView === 'table') {
    // Show table if we're in table view, regardless of whether filters are applied
    // This allows viewing the data table even without filters
    return <BenchmarkTable />;
  } else {
    // In all other cases, show the initial chart view
    return <InitialChartView />;
  }
};

export default ViewManager;
