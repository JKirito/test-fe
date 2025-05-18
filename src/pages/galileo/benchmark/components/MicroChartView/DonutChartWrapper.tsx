import React from 'react';
import { useFullscreen } from '@/components/toggle-fullscreen/ToggleFullscreenContext';
import { CustomDonutChart } from './CustomDonutChart';
import { forceResize } from './fullscreenHelper';
import { NoDataMessage } from './NoDataMessage';

interface DonutChartWrapperProps {
  data: any[];
  className?: string;
}

export const DonutChartWrapper: React.FC<DonutChartWrapperProps> = ({ data, className }) => {
  const { isFullscreen } = useFullscreen();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [key, setKey] = React.useState(0);

  // Handle resize and fullscreen changes
  React.useEffect(() => {
    if (!wrapperRef.current) return;

    // Create a ResizeObserver to monitor size changes
    const resizeObserver = new ResizeObserver(() => {
      // Force remount by changing key to ensure the chart redraws at the new size
      setKey((prev) => prev + 1);
    });

    // Start observing the wrapper element
    resizeObserver.observe(wrapperRef.current);

    // When fullscreen changes, force a resize after a delay
    const timeoutId = setTimeout(() => {
      // Force multiple resize events to ensure proper rendering
      const cleanup = forceResize(500);
      // Force remount
      setKey((prev) => prev + 1);
      return cleanup;
    }, 200);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isFullscreen]);

  // If there's no data, show the NoDataMessage component
  if (!data || data.length === 0) {
    return <NoDataMessage isPreview={!isFullscreen} message="No data available for donut chart" />;
  }

  return (
    <div
      className={`micro-chart-view__chart-wrapper micro-chart-view__chart-wrapper--donut ${className || ''}`}
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        maxHeight: isFullscreen ? '100%' : '80vh', // Add max-height constraint for initial view
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          flex: 1,
          maxHeight: isFullscreen ? '100%' : '80vh', // Add max-height constraint for initial view
        }}
      >
        <CustomDonutChart
          data={data}
          isPreview={!isFullscreen}
          key={`donut-chart-${isFullscreen ? 'fullscreen' : 'preview'}-${key}`} // Force remount on fullscreen toggle and key change
        />
      </div>
    </div>
  );
};
