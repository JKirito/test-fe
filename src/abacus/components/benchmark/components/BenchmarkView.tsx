import React from 'react';
import { useBenchmark } from '../BenchmarkContext';
import BenchmarkResultsTable from './BenchmarkResultsTable';
import BenchmarkTableActions from './BenchmarkTableActions';
import { DownloadIcon } from 'lucide-react';
import { exportBenchmarkToExcel } from './benchmarkExportUtils';
import ToggleSwitch from '../../../../components/toggle-switch/ToggleSwitch';
import './BenchmarkView.scss';

const BenchmarkView: React.FC = () => {
  const { state, dispatch } = useBenchmark();
  const {
    benchmarkData,
    selectedProjects,
    isLoading,
    error,
    excludedProjects,
    excludedRates,
    excludedRows,
  } = state;

  if (isLoading) {
    return (
      <div className="benchmark-view__loader-container">
        <div className="benchmark-view__loader-wrapper">
          <div className="benchmark-view__loader"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="benchmark-view__error-container">
        <div className="benchmark-view__error-box">
          <div className="benchmark-view__error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!selectedProjects) {
    return (
      <div className="benchmark-view">
        <div className="benchmark-view__missing-selection">Project selection is missing.</div>
      </div>
    );
  }

  const handleExportClick = () => {
    if (benchmarkData && selectedProjects && excludedProjects && excludedRates && excludedRows) {
      exportBenchmarkToExcel(
        benchmarkData,
        selectedProjects,
        excludedProjects,
        excludedRates,
        excludedRows,
        state.maskProjectNames // Pass the maskProjectNames state
      );
    } else {
      console.warn('Cannot export: Missing required benchmark data.');
    }
  };

  return (
    <div className="benchmark-view">
      <div className="benchmark-view__content-wrapper">
        <div className="benchmark-view__header">
          <div className="benchmark-view__actions">
            <button
              onClick={handleExportClick}
              className="benchmark-view__button benchmark-view__button--export"
              disabled={
                !benchmarkData ||
                benchmarkData.length === 0 ||
                !selectedProjects ||
                selectedProjects.length === 0 ||
                !excludedProjects ||
                !excludedRates ||
                !excludedRows
              }
            >
              <DownloadIcon className="benchmark-view__button__icon" />
              Export to Excel
            </button>
            <div className="benchmark-view__toggle-container">
              <span className="benchmark-view__toggle-label">Hide client names</span>
              <ToggleSwitch
                id="mask-project-names"
                isOn={state.maskProjectNames}
                onToggle={() => dispatch({ type: 'TOGGLE_MASK_PROJECT_NAMES' })}
              />
            </div>
          </div>
        </div>
        <div className="benchmark-view__content">
          <div className="benchmark-view__table-container">
            {benchmarkData && selectedProjects ? (
              <BenchmarkResultsTable
                data={benchmarkData}
                selectedProjects={selectedProjects}
                onDataChange={(updatedData) => {
                  dispatch({
                    type: 'SET_BENCHMARK_DATA',
                    payload: {
                      data: updatedData,
                      expandedCodes: Array.from(state.expandedCodes || new Set()),
                    },
                  });
                }}
              />
            ) : (
              <div className="benchmark-view__no-data">No benchmark data available</div>
            )}
          </div>
        </div>
      </div>
      <BenchmarkTableActions
        onBackToProjects={() => dispatch({ type: 'SET_STEP', payload: 'results' })}
      />
    </div>
  );
};

export default BenchmarkView;
