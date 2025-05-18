import React, { useState, useEffect, useCallback } from 'react';
import { useBenchmarkFilters } from '../hooks/useBenchmarkFilters';
import { useBenchmark } from '../BenchmarkContext';
import { BenchmarkResponse } from '../types/benchmark';
import { toast } from 'react-hot-toast';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import { IBenchmarkProject } from '../types';
import { processBenchmarkData } from '../utils/processBenchmarkData';
import ProjectSelectionTable from './ProjectSelectionTable';
import BenchmarkActions from './BenchmarkActions';
import DataRequestNotification from '@/components/data-request-notification/DataRequestNotification';
// import Spinner from '@/einstein/components/common/spinner/Spinner'; // Removed for now

const BenchmarkResults: React.FC = () => {
  const { results, isLoading, error, goToFilters } = useBenchmarkFilters();
  const { dispatch } = useBenchmark();
  const [selectedProjects, setSelectedProjects] = useState<IBenchmarkProject[]>([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Reset selection when filter results change
  useEffect(() => {
    setSelectedProjects([]);
  }, [results]);

  const handleSelectionChange = useCallback((project: IBenchmarkProject, isSelected: boolean) => {
    setSelectedProjects((prevSelected) => {
      if (isSelected) {
        // Add project if it's not already selected
        return prevSelected.some((p) => p._id === project._id)
          ? prevSelected
          : [...prevSelected, project];
      } else {
        // Remove project if it is selected
        return prevSelected.filter((p) => p._id !== project._id);
      }
    });
  }, []);

  const handleGenerateBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const projectCodes = selectedProjects.map((p) => p.project_code);
      const response = await abacusApiClient.post<BenchmarkResponse>('/projects/benchmark', {
        projectIds: projectCodes,
      });

      if (response.data?.data?.benchmarks && response.data?.data?.codes) {
        const processed = processBenchmarkData(response.data);
        const initiallyExpandedCodes = processed.filter((p) => p.level === 0).map((p) => p.code);

        dispatch({
          type: 'SET_BENCHMARK_DATA',
          payload: { data: processed, expandedCodes: initiallyExpandedCodes },
        });
        dispatch({ type: 'SET_SELECTED_PROJECTS', payload: selectedProjects });
        dispatch({ type: 'SET_STEP', payload: 'benchmark' });
        toast.success('Benchmark generated successfully!');
      } else {
        const missingData = [
          !response.data?.data?.benchmarks && 'benchmarks',
          !response.data?.data?.codes && 'codes',
        ]
          .filter(Boolean)
          .join(' and ');
        console.error(
          `Invalid data received from benchmark endpoint. Missing: ${missingData || 'unknown structure'}. Response:`,
          response.data
        );
        throw new Error(
          `Invalid data received from benchmark endpoint. Missing: ${missingData || 'unexpected format'}.`
        );
      }
    } catch (err: unknown) {
      console.error('Error generating benchmark:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`Failed to generate benchmark: ${errorMessage}`);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="benchmarkResults__loading">
          {/* <Spinner /> */}
          <p>Loading project results...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="benchmarkResults__error">
          <p>Error loading projects: {error}</p>
          <button onClick={goToFilters} className="benchmarkResults__errorButton">
            Return to filters
          </button>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="benchmarkResults__empty">
          <DataRequestNotification />
          <p>No matching projects found based on your filters.</p>
          <button onClick={goToFilters} className="benchmarkResults__errorButton">
            Modify filters
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="benchmarkResults__section">
          <h2 className="benchmarkResults__title">Select Projects for Benchmark Analysis</h2>
          <ProjectSelectionTable
            projects={results}
            selectedProjects={selectedProjects}
            onSelectionChange={handleSelectionChange}
          />
        </div>

        <BenchmarkActions
          selectedCount={selectedProjects.length}
          isBenchmarking={isBenchmarking}
          onGenerate={handleGenerateBenchmark}
          onBack={goToFilters}
        />
      </>
    );
  };

  return <div className="benchmarkResults__container">{renderContent()}</div>;
};

export default BenchmarkResults;
