import React, { useState, useEffect, useCallback } from 'react';
import './Playground.scss';
import { CombinedGanttChart } from '@/components/CombinedGanttChart';
import { DataTable } from '@/components/DataTable';
import { abacusApiClient } from '@/lib/config/axiosConfig';

// Define the data structure based on the API response
interface GanttChartData {
  _id: string;
  project_code: string;
  type: string;
  category_level: number;
  level_1_name: string;
  gantt_chart_legend: string;
  planned_start_date: string;
  planned_finish_date: string;
  actual_start_date: string;
  actual_finish_date: string;
  planned_duration: number;
  actual_duration: number;
}

// Common project types
const PROJECT_TYPES = {
  "education": "education",
};

// We're always using "Derived Data" as the level 1 name

const Playground: React.FC = () => {
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>("education"); // Default type
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartKey, setChartKey] = useState<number>(0); // Used to force chart reload
  const [isChartRefreshing, setIsChartRefreshing] = useState<boolean>(false);

  // State for chart data
  const [chartData, setChartData] = useState<GanttChartData[] | null>(null);
  const [chartDataLoading, setChartDataLoading] = useState<boolean>(true);
  const [chartDataError, setChartDataError] = useState<string | null>(null);

  // Memoize the onDataLoaded callback to prevent infinite re-renders
  const handleDataLoaded = useCallback((data: GanttChartData[] | null, loading: boolean, error: string | null) => {
    setChartData(data);
    setChartDataLoading(loading);
    setChartDataError(error);
  }, []);

  // Fetch the list of projects when the project type changes
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setSelectedProject(''); // Clear selected project when type changes
      try {
        // Fetch projects filtered by the selected type
        const response = await abacusApiClient.get(`/duration/list?type=${selectedType}`);
        if (response.data && Array.isArray(response.data.data)) {
          setProjects(response.data.data);
          // Set the first project as default selection if available
          if (response.data.data.length > 0) {
            setSelectedProject(response.data.data[0]);
          }
        } else {
          setError('Invalid response format from the server');
        }
      } catch (err) {
        console.error('Error fetching project list:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedType]);

  // Handle project selection change
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectCode = e.target.value;
    setSelectedProject(projectCode);
    // Indicate chart is refreshing
    setIsChartRefreshing(true);
    // Force chart to reload with new data
    setChartKey(prevKey => prevKey + 1);
    // Reset refreshing state after a short delay
    setTimeout(() => setIsChartRefreshing(false), 500);
  };

  // Handle project type selection change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
    // The projects will be updated via the useEffect hook
    // Chart will be refreshed when a new project is selected
  };

  return (
    <div className="playground">
      <div className="playground__layout">
        <div className="playground__content">
          <div className="flex justify-between items-center mb-6">
            <h1 className="playground__title">Combined Gantt Chart Demo</h1>
            {isChartRefreshing && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Refreshing chart...</span>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Chart Parameters</h2>
            <div className="selectors grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project Type
                </label>
                <select
                  id="type-select"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedType}
                  onChange={handleTypeChange}
                >
                  {Object.entries(PROJECT_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                {loading ? (
                  <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : (
                  <select
                    id="project-select"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedProject}
                    onChange={handleProjectChange}
                    disabled={projects.length === 0}
                  >
                    {projects.length === 0 ? (
                      <option value="" disabled>No projects available for this type</option>
                    ) : (
                      projects.map((project: string, index: number) => (
                        <option key={index} value={project}>
                          {project}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="playground__container">
            {selectedProject ? (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="chart-container relative lg:w-3/5" style={{ height: "600px", width: "100%" }}>
                  {isChartRefreshing && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <CombinedGanttChart
                    key={chartKey} // Force remount when changing params
                    projectCode={selectedProject}
                    projectType={selectedType}
                    level1Name="Derived Data" // Always use Derived Data
                    onDataLoaded={handleDataLoaded}
                  />
                </div>

                <div className="data-table-container lg:w-2/5 bg-white p-4 rounded-lg shadow-sm" style={{ height: "600px", overflowY: "auto" }}>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">Project Data</h2>
                  <DataTable
                    data={chartData}
                    loading={chartDataLoading}
                    error={chartDataError}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-60 text-gray-500">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <span>Loading projects...</span>
                  </div>
                ) : (
                  "Please select a project to display the chart"
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
