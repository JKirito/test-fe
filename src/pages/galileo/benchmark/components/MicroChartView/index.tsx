import React, { useEffect, useState } from 'react';
import { useBenchmark } from '../../store';
import { ScatterChartData, filterApi } from '../../filterApi';
import ChartLayout from '../chart/ChartLayout';
import { FullscreenProvider } from '@/components/toggle-fullscreen/ToggleFullscreenContext';
import ChartHeader from '../chart/ChartHeader';
import { ToggleFullscreen } from '@/components/toggle-fullscreen';
import { BarChartWrapper, ScatterChartWrapper, GanttChartWrapper } from './ChartWrapper';
import ScatterChartControls, { ScatterDisplayMode } from './ScatterChartControls';
import ChartToolbar from './ChartToolbar';
import BaseChartToolbar from '../chart/ChartToolbar';
import { SegmentedControlItem } from '@/components/segmented-menu/SegmentedMenu';
import '../chart/ChartLayout.scss';
import './ChartOverrides.scss'; // Import custom styles for all chart types
import './MicroChartView.scss';

// Define chart type options for the bar chart
const barChartTypeOptions: SegmentedControlItem[] = [
  { id: 'bar', label: 'Bar' },
  { id: 'spike', label: 'Spike' },
];

// Define legend data for both chart types (same for both)
const chartLegendData = [
  { color: '#00aeef', label: 'Planned Duration' },
  { color: '#ff6b6b', label: 'Actual Duration' },
];

// Define colors for different phases
const phaseColors = {
  design: '#E5BE27',
  planningApproval: '#4F4DD0',
  procurement: '#DC74CB',
  construction: '#02A785',
};

const MicroChartView: React.FC = () => {
  const { activeFilters, deselectedProjectIds } = useBenchmark();

  const [isLoading, setIsLoading] = useState(true);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [scatterChartData, setScatterChartData] = useState<ScatterChartData[]>([]);
  const [ganttChartData, setGanttChartData] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [barChartType, setBarChartType] = useState<string>('bar'); // Default to spike chart
  const [scatterDisplayMode, setScatterDisplayMode] = useState<ScatterDisplayMode>('both');

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Format deselected project IDs as objects with index and projectId properties
        const deselectedRows = deselectedProjectIds.map((projectId, index) => ({
          index: String(index),
          projectId: projectId,
        }));

        // console.log('Formatted deselected rows:', deselectedRows);
        // console.log('Active filters:', activeFilters);

        // Fetch chart data in parallel
        // If no filters are applied, pass an empty object to get all data
        const [barData, scatterData, ganttData] = await Promise.all([
          filterApi.getBarChartData({ filters: activeFilters, deselectedRows }),
          filterApi.getScatterChartData({ filters: activeFilters, deselectedRows }),
          filterApi.getGanttChartData({ filters: activeFilters, deselectedRows }),
        ]);

        // Transform bar chart data to match BarChart component requirements
        const formattedBarData = barData.map((item, index) => ({
          stage: item.stage,
          planned: item.planned,
          actual: item.actual,
          label: item.stage,
          color: index % 2 === 0 ? '#00aeef' : '#ff6b6b',
          metric: item.metric || 'months',
        }));

        // Scatter chart data is already in the correct format

        // Transform gantt chart data to match Gantt component requirements
        const formattedGanttData = ganttData.map((item) => ({
          name: item.name,
          phase: item.phase,
          duration: item.duration,
          startTime: typeof item.startTime === 'object' ? item.startTime.getTime() : item.startTime,
          color: item.color,
          metric: item.metric,
        }));

        setBarChartData(formattedBarData);
        setScatterChartData(scatterData);
        setGanttChartData(formattedGanttData);

        // console.log('Chart data loaded successfully');
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [activeFilters, deselectedProjectIds]);

  // Handle bar chart type change
  const handleBarChartTypeChange = (item: SegmentedControlItem) => {
    setBarChartType(item.id);
  };

  const handleScatterDisplayModeChange = (mode: ScatterDisplayMode) => {
    setScatterDisplayMode(mode);
  };

  // Get legend data (same for both chart types now)
  const getBarChartLegendData = () => {
    return chartLegendData;
  };

  return (
    <div className="micro-chart-view">
      {isLoading && (
        <div
          className="micro-chart-view__loading"
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
            <p style={{ fontSize: '16px', color: 'var(--e-grayscale-600)' }}>
              Loading chart data...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="micro-chart-view__error">
          <p>Error loading chart data: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="micro-chart-view__charts">
          <div className="micro-chart-view__chart">
            <FullscreenProvider>
              <ToggleFullscreen>
                <ChartLayout
                  className="micro-chart-view__chart-layout"
                  header={
                    <ChartHeader
                      title="Macro View Average As-planned vs As-built Project Duration by Stage"
                      description="Planned vs actual project durations"
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
                    <div className="micro-chart-view__chart-content">
                      <BarChartWrapper
                        data={barChartData}
                        chartType={barChartType}
                        xAxisLabel="Duration (months)"
                      />
                    </div>
                  }
                  legend={
                    barChartData && barChartData.length > 0 ? (
                      <div className="micro-chart-view__legend">
                        {getBarChartLegendData().map((item, index) => (
                          <div key={index} className="micro-chart-view__legend-item">
                            <span
                              className="micro-chart-view__legend-color"
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

          <div className="micro-chart-view__chart">
            <FullscreenProvider>
              <ToggleFullscreen>
                <ChartLayout
                  className="micro-chart-view__chart-layout"
                  header={
                    <ChartHeader
                      title="Macro View Project-specific criteria vs Overall Duration Trends"
                      description="Analysing the relationship between project duration and GFA"
                    />
                  }
                  toolbar={
                    <BaseChartToolbar
                      tools={
                        <ScatterChartControls
                          value={scatterDisplayMode}
                          onChange={handleScatterDisplayModeChange}
                        />
                      }
                    />
                  }
                  chart={
                    <div className="micro-chart-view__chart-content">
                      <ScatterChartWrapper
                        data={scatterChartData}
                        displayMode={scatterDisplayMode}
                      />
                    </div>
                  }
                  legend={
                    scatterChartData && scatterChartData.length > 0 ? (
                      <div className="micro-chart-view__legend">
                        <div className="micro-chart-view__legend-item">
                          <span
                            className="micro-chart-view__legend-color"
                            style={{ backgroundColor: '#00aeef' }}
                          ></span>
                          <span>Planned Duration</span>
                        </div>
                        <div className="micro-chart-view__legend-item">
                          <span
                            className="micro-chart-view__legend-color"
                            style={{ backgroundColor: '#ff6b6b' }}
                          ></span>
                          <span>Actual Duration</span>
                        </div>
                        <div className="micro-chart-view__legend-item">
                          <span
                            className="micro-chart-view__legend-line"
                            style={{ borderTop: '2px solid #00aeef' }}
                          ></span>
                          <span>Planned Trend Line</span>
                        </div>
                        <div className="micro-chart-view__legend-item">
                          <span
                            className="micro-chart-view__legend-line"
                            style={{ borderTop: '2px dashed #ff6b6b' }}
                          ></span>
                          <span>Actual Trend Line</span>
                        </div>
                      </div>
                    ) : null
                  }
                />
              </ToggleFullscreen>
            </FullscreenProvider>
          </div>

          <div className="micro-chart-view__chart">
            <FullscreenProvider>
              <ToggleFullscreen>
                <ChartLayout
                  className="micro-chart-view__chart-layout"
                  header={
                    <ChartHeader
                      title="Macro View End-to-end Average Projects Timeline"
                      description="Project phases with planned and actual dates"
                    />
                  }
                  chart={
                    <div className="micro-chart-view__chart-content">
                      <GanttChartWrapper data={ganttChartData} />
                    </div>
                  }
                  legend={
                    ganttChartData && ganttChartData.length > 0 ? (
                      <div className="micro-chart-view__legend">
                        {ganttChartData.map((item, index) => (
                          <div key={index} className="micro-chart-view__legend-item">
                            <span
                              className="micro-chart-view__legend-color"
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

export default MicroChartView;
