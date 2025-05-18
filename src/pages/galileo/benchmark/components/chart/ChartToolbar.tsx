import React from 'react';
import './ChartToolbar.scss';
import { useFullscreen } from '@/components/toggle-fullscreen/ToggleFullscreenContext';

interface ChartToolbarProps {
  tools?: React.ReactNode;
  cta?: React.ReactNode;
}

const ChartToolbar = ({ tools, cta }: ChartToolbarProps) => {
  const { isFullscreen } = useFullscreen();
  return (
    <div className="chart-toolbar">
      {tools && <div className="chart-toolbar__tools">{tools}</div>}
      {isFullscreen && cta && <div className="chart-toolbar__cta">{cta}</div>}
    </div>
  );
};

export default ChartToolbar;
