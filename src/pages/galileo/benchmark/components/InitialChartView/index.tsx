import React, { useEffect, useState } from 'react';
import { DonutChartData, filterApi } from '../../filterApi';
import {
  FullscreenProvider,
  useFullscreen,
} from '@/components/toggle-fullscreen/ToggleFullscreenContext';
import { ToggleFullscreen } from '@/components/toggle-fullscreen';
import ChartLayout from '../chart/ChartLayout';
import ChartHeader from '../chart/ChartHeader';
import { DonutChartWrapper } from '../MicroChartView/DonutChartWrapper';
import { CustomBarChart } from '../MicroChartView/CustomBarChart';
import ChartToolbar from './ChartToolbar';
import { SegmentedControlItem } from '@/components/segmented-menu/SegmentedMenu';
import { NoDataMessage } from '../MicroChartView/NoDataMessage';
import './InitialChartView.scss';
import './ChartToolbar.scss';

// Define chart type options
const chartTypeOptions: SegmentedControlItem[] = [
  { id: 'donut', label: 'Donut' },
  { id: 'bar', label: 'Bar' },
];

/**
 * InitialChartView component that displays a Donut chart showing the distribution of projects
 * This is shown when no filters have been applied yet
 */
const InitialChartView: React.FC = () => {
  const [donutChartData, setDonutChartData] = useState<DonutChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [chartType, setChartType] = useState<string>('donut');

  useEffect(() => {
    const fetchDonutData = async () => {
      try {
        setIsLoading(true);
        const data = await filterApi.getDonutChartData();
        setDonutChartData(data);
      } catch (err) {
        console.error('Error fetching donut chart data:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonutData();
  }, []);

  if (isLoading) {
    return (
      <div className="initial-chart-view__loading">
        <div className="e-loader"></div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="initial-chart-view__error">
        <p>Error loading chart data. Please try again later.</p>
        <p className="initial-chart-view__error-message">{error.message}</p>
      </div>
    );
  }

  // Handle chart type change
  const handleChartTypeChange = (item: SegmentedControlItem) => {
    setChartType(item.id);
  };

  // Inner component that uses the useFullscreen hook within the FullscreenProvider
  const ChartContent = () => {
    const { isFullscreen } = useFullscreen();

    // Check if there's no data
    if (!donutChartData || donutChartData.length === 0) {
      return (
        <div className="initial-chart-view__chart-content">
          <NoDataMessage isPreview={!isFullscreen} message="No data available for chart view" />
        </div>
      );
    }

    // Render the appropriate chart based on the selected chart type
    const renderChart = () => {
      switch (chartType) {
        case 'bar':
          return <CustomBarChart data={donutChartData} isPreview={!isFullscreen} />;
        case 'donut':
        default:
          return <DonutChartWrapper data={donutChartData} />;
      }
    };

    return <div className="initial-chart-view__chart-content">{renderChart()}</div>;
  };

  return (
    <div className="initial-chart-view">
      <div className="initial-chart-view__content">
        <div className="initial-chart-view__chart">
          <FullscreenProvider>
            <ToggleFullscreen>
              <ChartLayout
                showLegendOnSmallScreen={true}
                className="initial-chart-view__chart-layout"
                header={
                  <ChartHeader
                    title="Number (and %) of all TBH projects by Primary Market (Sector)"
                    description="Distribution of projects across sectors"
                  />
                }
                toolbar={
                  <ChartToolbar
                    chartTypes={chartTypeOptions}
                    activeChartType={chartType}
                    onChartTypeChange={handleChartTypeChange}
                  />
                }
                chart={<ChartContent />}
                legend={
                  donutChartData && donutChartData.length > 0 ? (
                    <div className="initial-chart-view__legend">
                      {donutChartData.map((item, index) => (
                        <div key={index} className="initial-chart-view__legend-item">
                          <div
                            className="initial-chart-view__legend-color"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <div className="initial-chart-view__legend-label">
                            <span>{item.label}</span>
                          </div>
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
    </div>
  );
};

export default InitialChartView;
