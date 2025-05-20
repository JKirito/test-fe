import React, { useEffect } from 'react';
import { useBenchmarkFilters, Project } from '../../context/BenchmarkFiltersContext';
import './BenchmarkTable.scss';
import NoDataMessage from './NoDataMessage';
import ProjectTable from './ProjectTable';
import TableActions from './TableActions';
import DataRequestNotification from '@/components/data-request-notification/DataRequestNotification';

const BenchmarkTable: React.FC = () => {
  const { tableData, isLoading, toggleProjectSelection, deselectedProjectIds, applyFilters } =
    useBenchmarkFilters();

  // Fetch data when the component mounts, even if no filters are applied
  useEffect(() => {
    if (!tableData?.data || tableData.data.length === 0) {
      applyFilters(1);
    }
  }, [applyFilters, tableData]);

  // Debug: Log deselected project IDs when they change
  useEffect(() => {
    // console.log('Deselected project IDs:', deselectedProjectIds);
  }, [deselectedProjectIds]);

  // Handle project selection
  const handleSelectionChange = (project: Project, isSelected: boolean) => {
    // Use projectid or _id depending on what's available
    const projectId = project.projectid || project._id || '';
    // console.log('Selection change:', projectId, isSelected);

    // Update the selection in the context
    toggleProjectSelection(projectId, isSelected);
  };

  // If no filters have been applied yet, we'll still show the table
  // The data will be fetched when the user clicks the "View Data" button

  // If loading, show a loading message
  if (isLoading) {
    return <NoDataMessage message="Loading benchmark data..." isLoading />;
  }

  // If no data after applying filters, show a message
  if (!tableData?.data || tableData.data.length === 0) {
    return <NoDataMessage message="No projects match the selected filters" />;
  }

  return (
    <div className="benchmark-table border-0 p-0">
      {/* <div className="benchmark-table__header">
        <h2 className="benchmark-table__title">Benchmark Results</h2>
        <div className="benchmark-table__actions">
          <span className="benchmark-table__count">
            {tableData.total} project{tableData.total !== 1 ? 's' : ''} found
          </span>
          <button className="e-btn-export" onClick={handleExportCSV}>
            Export to CSV
          </button>
        </div>
      </div> */}
      <DataRequestNotification />
      <ProjectTable projects={tableData.data} onSelectionChange={handleSelectionChange} />

      <TableActions
        currentPage={tableData.page}
        totalPages={tableData.totalPages}
        totalRecords={tableData.total}
        pageLimit={tableData.limit}
      />
    </div>
  );
};

export default BenchmarkTable;
