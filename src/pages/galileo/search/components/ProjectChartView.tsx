import React, { useEffect, useState } from 'react';
import { useSearchContext } from '../context/SearchContext';
import apiClient from '@/lib/config/axiosConfig';
import { FullscreenProvider } from '@/components/toggle-fullscreen/ToggleFullscreenContext';
import ChartLayout from '../../benchmark/components/chart/ChartLayout';
import ChartHeader from '../../benchmark/components/chart/ChartHeader';
import { ToggleFullscreen } from '@/components/toggle-fullscreen';
import {
  BarChartWrapper,
  GanttChartWrapper,
} from '../../benchmark/components/MicroChartView/ChartWrapper';
import ChartToolbar from '../../benchmark/components/MicroChartView/ChartToolbar';
import { SegmentedControlItem } from '@/components/segmented-menu/SegmentedMenu';
import './ProjectChartView.scss';
import DataRequestNotification from '@/components/data-request-notification/DataRequestNotification';

// Define chart type options for the bar charts
const barChartTypeOptions: SegmentedControlItem[] = [
  { id: 'spike', label: 'Spike' },
  { id: 'bar', label: 'Bar' },
];

// Define legend data for both chart types (same for both)
const chartLegendData = [
  { color: '#00aeef', label: 'Planned Duration' },
  { color: '#ff6b6b', label: 'Actual Duration' },
];

// Define chart type options for the second bar chart
const secondBarChartTypeOptions: SegmentedControlItem[] = [
  { id: 'spike', label: 'Spike' },
  { id: 'bar', label: 'Bar' },
];

const ProjectChartView: React.FC = () => {
  const { projectId, projectName } = useSearchContext();

  const [isLoading, setIsLoading] = useState(true);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [secondBarChartData, setSecondBarChartData] = useState<any[]>([]);
  const [ganttChartData, setGanttChartData] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [barChartType, setBarChartType] = useState<string>('spike'); // Default to spike chart
  const [secondBarChartType, setSecondBarChartType] = useState<string>('bar'); // Default to bar chart

  useEffect(() => {
    const fetchChartData = async () => {
      if (!projectId) return;

      setIsLoading(true);
      setError(null);

      // console.log('Fetching chart data for project ID:', projectId);

      try {
        // Fetch bar chart data for cost by stage
        const barData = await apiClient.get(`/projects/filtered/cost-by-stage/${projectId}`);

        // Fetch second bar chart data (using the area-duration-average endpoint)
        const secondBarData = await apiClient.post('/projects/filtered/area-duration-average', {
          filters: { projectid: [projectId] },
          deselectedRows: [],
        });

        // Fetch gantt chart data
        // console.log('Fetching Gantt chart data for project ID:', projectId);
        const ganttData = await apiClient.get(
          `/projects/filtered/timeline-data-by-phase/${projectId}`
        );
        console.log('Gantt chart data response:', ganttData.data);

        // Transform first bar chart data to match BarChart component requirements
        const formattedBarData = barData.data.map((item: any, index: number) => ({
          stage: item.stage,
          planned: item.planned,
          actual: item.actual,
          label: item.stage,
          color: index % 2 === 0 ? '#00aeef' : '#ff6b6b',
          metric: item.metric || 'months',
        }));

        // Transform second bar chart data from area-duration-average endpoint
        const formattedSecondBarData = secondBarData.data.map((item: any, index: number) => ({
          stage: item.stage || item.label || `Stage ${index + 1}`,
          planned: item.planned || item.totalplannedduration || 0,
          actual: item.actual || item.totalactualduration || 0,
          label: item.stage || item.label || `Stage ${index + 1}`,
          color: index % 2 === 0 ? '#00aeef' : '#ff6b6b',
          metric: item.metric || 'months',
        }));

        // Transform gantt chart data to match Gantt component requirements
        // Use the original order from the API response instead of sorting by start date
        const ganttDataArray = [...ganttData.data];

        // Now map the data to the format expected by the Gantt chart, preserving original order
        const formattedGanttData = ganttDataArray.map((item: any) => {
          // Check if the data has the expected structure
          if (item.planned && item.actual && item.label) {
            // Calculate start times as timestamps
            const actualStartTime = new Date(item.actual.start).getTime();
            const plannedStartTime = new Date(item.planned.start).getTime();

            // Calculate end times as timestamps
            const actualEndTime = new Date(item.actual.end).getTime();
            const plannedEndTime = new Date(item.planned.end).getTime();

            return {
              name: item.label,
              phase: item.phase,
              duration: item.actual.duration,
              startTime: actualStartTime,
              color: item.color,
              metric: item.metric || 'months',
              // Add additional properties that might be needed by the chart
              planned: {
                start: plannedStartTime,
                end: plannedEndTime,
                duration: item.planned.duration,
              },
              actual: {
                start: actualStartTime,
                end: actualEndTime,
                duration: item.actual.duration,
              },
            };
          } else {
            console.warn('Unexpected data format for Gantt chart item:', item);
            // Provide a fallback format
            return {
              name: item.label || 'Unknown',
              phase: item.phase || 'Unknown',
              duration: item.duration || 0,
              startTime: item.startTime || Date.now(),
              color: item.color || '#cccccc',
              metric: item.metric || 'months',
            };
          }
        });

        // console.log('Formatted Gantt chart data:', formattedGanttData);

        setBarChartData(formattedBarData);
        setSecondBarChartData(formattedSecondBarData);
        setGanttChartData(formattedGanttData);

        console.log('Bar chart data:', formattedBarData);
        console.log('Second bar chart data:', formattedSecondBarData);
        console.log('Gantt chart data:', formattedGanttData);
        console.log('Chart data loaded successfully');
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [projectId]);

  // Handle bar chart type change
  const handleBarChartTypeChange = (item: SegmentedControlItem) => {
    setBarChartType(item.id);
  };

  // Handle second bar chart type change
  const handleSecondBarChartTypeChange = (item: SegmentedControlItem) => {
    setSecondBarChartType(item.id);
  };

  // Get legend data for the first chart
  // const getBarChartLegendData = () => {
  //   return chartLegendData;
  // };

  // Get legend data for the second chart (same as first chart)
  const getSecondBarChartLegendData = () => {
    return chartLegendData;
  };

  const haveChartsData =
    barChartData.length > 0 || secondBarChartData.length > 0 || ganttChartData.length > 0;

  if (!projectId) {
    return (
      <div className="project-chart-view__empty">
        <img src="/icons/chart.svg" alt="Chart Logo Image" />
        <p>Please search for a project to view charts</p>
      </div>
    );
  }

  return (
    <div className="project-chart-view">
      {isLoading && (
        <div className="project-chart-view__loading">
          <div className="e-loader"></div>
          <p>Loading chart data...</p>
        </div>
      )}

      {error && (
        <div className="project-chart-view__error">
          <p>Error loading chart data: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && !haveChartsData && (
        <div className="project-chart-view__empty">
          <DataRequestNotification />
          <p className="font-rubik">
            We are on a lookout for duration dataset for project ID {projectId} - {projectName}
          </p>
        </div>
      )}

      {!isLoading && !error && haveChartsData && (
        <div className="project-chart-view__charts" data-layout="row">
          {/* <div className="project-chart-view__chart">
            <FullscreenProvider>
              <ToggleFullscreen>
                <ChartLayout
                  className="project-chart-view__chart-layout"
                  header={
                    <ChartHeader
                      title="As-Planned vs As-Built Project Duration by Cost"
                      description="As-Planned vs As-Built Project Duration by Cost"
                    />
                  }
                  toolbar={
                    <ChartToolbar
                      chartTypes={barChartTypeOptions}
                      activeChartType={barChartType}
                      onChartTypeChange={handleBarChartTypeChange}
                    />
                  }
                  chart={
                    <div className="project-chart-view__chart-content">
                      <BarChartWrapper
                        data={barChartData}
                        chartType={barChartType}
                        xAxisLabel={`Duration (${barChartData?.[0]?.metric || 'months'})`}
                        rotateLabels={true}
                      />
                    </div>
                  }
                  legend={
                    barChartData && barChartData.length > 0 ? (
                      <div className="project-chart-view__legend">
                        {getBarChartLegendData().map((item, index) => (
                          <div key={index} className="project-chart-view__legend-item">
                            <span
                              className="project-chart-view__legend-color"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : null
                  }
                />
              </ToggleFullscreen>
            </FullscreenProvider>
          </div> */}

          <div className="project-chart-view__chart">
            <FullscreenProvider>
              <ToggleFullscreen>
                <ChartLayout
                  className="project-chart-view__chart-layout"
                  header={
                    <ChartHeader
                      title="As-Planned vs As-Built Project Duration by Stage"
                      description="Planned vs actual project durations by stage"
                    />
                  }
                  toolbar={
                    <ChartToolbar
                      chartTypes={secondBarChartTypeOptions}
                      activeChartType={secondBarChartType}
                      onChartTypeChange={handleSecondBarChartTypeChange}
                    />
                  }
                  chart={
                    <div className="project-chart-view__chart-content">
                      <BarChartWrapper
                        data={secondBarChartData}
                        chartType={secondBarChartType}
                        xAxisLabel={`Duration (${secondBarChartData?.[0]?.metric || 'months'})`}
                        rotateLabels={true}
                      />
                    </div>
                  }
                  legend={
                    secondBarChartData && secondBarChartData.length > 0 ? (
                      <div className="project-chart-view__legend">
                        {getSecondBarChartLegendData().map((item, index) => (
                          <div key={index} className="project-chart-view__legend-item">
                            <span
                              className="project-chart-view__legend-color"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : null
                  }
                />
              </ToggleFullscreen>
            </FullscreenProvider>
          </div>

          <div className="project-chart-view__chart">
            <FullscreenProvider>
              <ToggleFullscreen>
                <ChartLayout
                  className="project-chart-view__chart-layout"
                  header={
                    <ChartHeader
                      title="End-to-end Project Timeline"
                      description="Project phases with planned and actual dates"
                    />
                  }
                  chart={
                    <div className="project-chart-view__chart-content">
                      <GanttChartWrapper data={ganttChartData} useTimelineChart={true} />
                    </div>
                  }
                  legend={
                    ganttChartData && ganttChartData.length > 0 ? (
                      <div className="project-chart-view__legend">
                        {ganttChartData.map((item, index) => (
                          <div key={index} className="project-chart-view__legend-item">
                            <span
                              className="project-chart-view__legend-color"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : null
                  }
                />
              </ToggleFullscreen>
            </FullscreenProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectChartView;
