import React from 'react';
import { useFullscreen } from '@/components/toggle-fullscreen/ToggleFullscreenContext';
import { CustomScatterChart } from './CustomScatterChart';
import { forceResize } from './fullscreenHelper';
import { CustomBarChartWithPhases } from './CustomBarChartWithPhases';
import { CustomGanttChart } from './CustomGanttChart';
import { CustomTimelineGanttChart } from './CustomTimelineGanttChart';
import { NoDataMessage } from './NoDataMessage';
import { ScatterDisplayMode } from './ScatterChartControls';

interface BarChartWrapperProps {
  data: any[];
  chartType: string;
  className?: string;
  xAxisLabel?: string;
  rotateLabels?: boolean;
}

export const BarChartWrapper: React.FC<BarChartWrapperProps> = ({
  data,
  chartType,
  className,
  xAxisLabel = 'Duration (months)',
  rotateLabels = false,
}) => {
  const { isFullscreen } = useFullscreen();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [key, setKey] = React.useState(0);

  // Handle fullscreen state changes more gracefully
  React.useEffect(() => {
    if (wrapperRef.current) {
      // First, ensure any existing tooltips are hidden smoothly
      const tooltip = document.querySelector('.bar-chart-tooltip');
      if (tooltip) {
        (tooltip as HTMLElement).style.opacity = '0';
      }

      // Use the helper function to force resize events with reduced frequency
      const cleanup = forceResize(300); // Use standard delay for bar chart

      // Use a short timeout before forcing remount to allow tooltip to fade out
      const remountTimeout = setTimeout(() => {
        setKey((prev) => prev + 1);
      }, 100);

      return () => {
        cleanup();
        clearTimeout(remountTimeout);
      };
    }
  }, [isFullscreen]);

  // Check if there's no data
  if (!data || data.length === 0) {
    return (
      <div
        className={`micro-chart-view__chart-wrapper micro-chart-view__chart-wrapper--bar ${className || ''}`}
        ref={wrapperRef}
        style={{
          width: '100%',
          height: isFullscreen ? '100%' : '350px',
          display: 'flex',
          flex: isFullscreen ? 1 : 'none',
          flexDirection: 'column',
          minHeight: isFullscreen ? '100%' : '350px',
          maxHeight: isFullscreen ? 'none' : '350px',
        }}
      >
        <NoDataMessage isPreview={!isFullscreen} message="No data available for bar chart" />
      </div>
    );
  }

  return (
    <div
      className={`micro-chart-view__chart-wrapper micro-chart-view__chart-wrapper--bar ${className || ''}`}
      ref={wrapperRef}
      style={{
        width: '100%',
        height: isFullscreen ? '100%' : '350px',
        display: 'flex',
        flex: isFullscreen ? 1 : 'none',
        flexDirection: 'column',
        minHeight: isFullscreen ? '100%' : '350px',
        maxHeight: isFullscreen ? 'none' : '350px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flex: isFullscreen ? 1 : 'none',
          flexDirection: 'column',
          position: 'relative',
          minHeight: isFullscreen ? '100%' : 'auto',
        }}
      >
        <CustomBarChartWithPhases
          data={data}
          chartType={chartType}
          isPreview={!isFullscreen}
          key={`bar-chart-${isFullscreen ? 'fullscreen' : 'preview'}-${key}`} // Force remount on fullscreen toggle and key change
          phaseColors={{
            design: '#E5BE27',
            planningApproval: '#4F4DD0',
            procurement: '#DC74CB',
            construction: '#02A785',
          }}
          useRoundedCorners={true}
          cornerRadius={12}
          xAxisLabel={xAxisLabel}
          rotateLabels={rotateLabels}
        />
      </div>
    </div>
  );
};

interface ScatterChartWrapperProps {
  data: any[];
  className?: string;
  displayMode?: ScatterDisplayMode;
}

export const ScatterChartWrapper: React.FC<ScatterChartWrapperProps> = ({ data, className, displayMode = 'both' }) => {
  const { isFullscreen } = useFullscreen();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [key, setKey] = React.useState(0);

  // // console.log('ScatterChartWrapper: isFullscreen', isFullscreen);

  // Handle fullscreen state changes more gracefully
  React.useEffect(() => {
    if (wrapperRef.current) {
      // First, ensure any existing tooltips are hidden smoothly
      const tooltip = document.querySelector('.scatter-chart-tooltip');
      if (tooltip) {
        (tooltip as HTMLElement).style.opacity = '0';
      }

      // Use the helper function to force resize events with reduced frequency
      const cleanup = forceResize(600); // Reduced delay to minimize flickering

      // Use a short timeout before forcing remount to allow tooltip to fade out
      const remountTimeout = setTimeout(() => {
        setKey((prev) => prev + 1);
      }, 100);

      return () => {
        cleanup();
        clearTimeout(remountTimeout);
      };
    }
  }, [isFullscreen]);

  // Check if there's no data
  if (!data || data.length === 0) {
    return (
      <div
        className={`micro-chart-view__chart-wrapper micro-chart-view__chart-wrapper--scatter ${className || ''} ${isFullscreen ? 'fullscreen-wrapper' : ''}`}
        ref={wrapperRef}
        style={{
          width: '100%',
          height: isFullscreen ? '100%' : '350px',
          display: 'flex',
          flex: isFullscreen ? 1 : 'none',
          flexDirection: 'column',
          minHeight: isFullscreen ? '100%' : '350px',
          maxHeight: isFullscreen ? 'none' : '350px',
        }}
      >
        <NoDataMessage isPreview={!isFullscreen} message="No data available for scatter chart" />
      </div>
    );
  }

  return (
    <div
      className={`micro-chart-view__chart-wrapper micro-chart-view__chart-wrapper--scatter ${className || ''} ${isFullscreen ? 'fullscreen-wrapper' : ''}`}
      ref={wrapperRef}
      style={{
        width: '100%',
        height: isFullscreen ? '100%' : '350px',
        display: 'flex',
        flex: isFullscreen ? 1 : 'none',
        flexDirection: 'column',
        minHeight: isFullscreen ? '100%' : '350px',
        maxHeight: isFullscreen ? 'none' : '350px',
      }}
    >
      <div
        className={isFullscreen ? 'fullscreen-inner' : ''}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flex: isFullscreen ? 1 : 'none',
          flexDirection: 'column',
          position: 'relative',
          minHeight: isFullscreen ? '100%' : 'auto',
        }}
      >
        <CustomScatterChart
          data={data}
          isPreview={!isFullscreen}
          displayMode={displayMode}
          key={`scatter-chart-${isFullscreen ? 'fullscreen' : 'preview'}-${key}`} // Force remount on fullscreen toggle and key change
        />
      </div>
    </div>
  );
};

interface GanttChartWrapperProps {
  data: any[];
  className?: string;
  useTimelineChart?: boolean;
}

export const GanttChartWrapper: React.FC<GanttChartWrapperProps> = ({
  data,
  className,
  useTimelineChart = false,
}) => {
  const { isFullscreen } = useFullscreen();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [key, setKey] = React.useState(0);

  // Handle fullscreen state changes more gracefully
  React.useEffect(() => {
    if (wrapperRef.current) {
      // First, ensure any existing tooltips are hidden smoothly
      const tooltip = document.querySelector('.gantt-chart-tooltip');
      if (tooltip) {
        (tooltip as HTMLElement).style.opacity = '0';
      }

      // Use the helper function to force resize events with reduced frequency
      const cleanup = forceResize(600); // Use a longer delay for GanttChart

      // Use a short timeout before forcing remount to allow tooltip to fade out
      const remountTimeout = setTimeout(() => {
        setKey((prev) => prev + 1);
      }, 100);

      return () => {
        cleanup();
        clearTimeout(remountTimeout);
      };
    }
  }, [isFullscreen]);

  // Check if there's no data
  if (!data || data.length === 0) {
    return (
      <div
        className={`micro-chart-view__chart-wrapper micro-chart-view__chart-wrapper--gantt ${className || ''}`}
        ref={wrapperRef}
        style={{
          width: '100%',
          height: isFullscreen ? '100%' : '350px',
          display: 'flex',
          flex: isFullscreen ? 1 : 'none',
          flexDirection: 'column',
          minHeight: isFullscreen ? '100%' : '350px',
          maxHeight: isFullscreen ? 'none' : '350px',
        }}
      >
        <NoDataMessage isPreview={!isFullscreen} message="No data available for gantt chart" />
      </div>
    );
  }

  return (
    <div
      className={`micro-chart-view__chart-wrapper micro-chart-view__chart-wrapper--gantt ${className || ''}`}
      ref={wrapperRef}
      style={{
        width: '100%',
        height: isFullscreen ? '100%' : '350px',
        display: 'flex',
        flex: isFullscreen ? 1 : 'none',
        flexDirection: 'column',
        minHeight: isFullscreen ? '100%' : '350px',
        maxHeight: isFullscreen ? 'none' : '350px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flex: isFullscreen ? 1 : 'none',
          flexDirection: 'column',
          position: 'relative',
          minHeight: isFullscreen ? '100%' : 'auto',
        }}
      >
        {useTimelineChart ? (
          <CustomTimelineGanttChart
            data={data}
            isPreview={!isFullscreen}
            key={`timeline-gantt-chart-${isFullscreen ? 'fullscreen' : 'preview'}-${key}`} // Force remount on fullscreen toggle and key change
          />
        ) : (
          <CustomGanttChart
            data={data}
            isPreview={!isFullscreen}
            key={`gantt-chart-${isFullscreen ? 'fullscreen' : 'preview'}-${key}`} // Force remount on fullscreen toggle and key change
          />
        )}
      </div>
    </div>
  );
};
