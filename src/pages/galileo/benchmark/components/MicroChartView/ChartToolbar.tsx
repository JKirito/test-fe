import React from 'react';
import { SegmentedMenu, SegmentedControlItem } from '@/components/segmented-menu/SegmentedMenu';
import '../../components/InitialChartView/ChartToolbar.scss'; // Reuse the existing styles

interface ChartToolbarProps {
  chartTypes: SegmentedControlItem[];
  activeChartType: string;
  onChartTypeChange: (item: SegmentedControlItem) => void;
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({
  chartTypes,
  activeChartType,
  onChartTypeChange,
}) => {
  return (
    <div className="chart-toolbar">
      <div className="chart-toolbar__content">
        <SegmentedMenu
          items={chartTypes}
          defaultActiveId={activeChartType}
          onChange={onChartTypeChange}
          className="chart-toolbar__segmented-menu"
        />
      </div>
    </div>
  );
};

export default ChartToolbar;
