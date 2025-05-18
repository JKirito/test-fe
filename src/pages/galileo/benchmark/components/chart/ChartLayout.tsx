import React from 'react';
import './ChartLayout.scss';
import { useFullscreen } from '@/components/toggle-fullscreen/ToggleFullscreenContext';

interface ChartLayoutProps {
  header: React.ReactNode;
  toolbar?: React.ReactNode;
  chart: React.ReactNode;
  legend?: React.ReactNode;

  showLegendOnSmallScreen?: boolean;

  className?: string;
}

export const ChartLayout: React.FC<ChartLayoutProps> = ({
  header,
  toolbar,
  chart,
  legend,
  className,
  showLegendOnSmallScreen = false,
}) => {
  const { isFullscreen } = useFullscreen();
  // // console.log('ChartLayout: isFullscreen', isFullscreen);

  return (
    <div className={`chart-layout ${className}`}>
      {header && <div className="chart-layout__header">{header}</div>}
      {toolbar ? (
        <div className="chart-layout__toolbar">{toolbar}</div>
      ) : (
        <div className="chart-layout__toolbar-placeholder"></div>
      )}
      <div className="chart-layout__content">
        {chart && <div className="chart-layout__chart">{chart}</div>}
        {/* {isFullscreen && legend && <div className="chart-layout__legend">{legend}</div>} */}
        {(showLegendOnSmallScreen || isFullscreen) && legend && (
          <div className="chart-layout__legend">{legend}</div>
        )}
      </div>
    </div>
  );
};

export default ChartLayout;
