import React from 'react';
import { SegmentedMenu, SegmentedControlItem } from '@/components/segmented-menu/SegmentedMenu';
import { useFullscreen } from '@/components/toggle-fullscreen/ToggleFullscreenContext';

export type ScatterDisplayMode = 'both' | 'planned' | 'actual';

interface ScatterChartControlsProps {
  value: ScatterDisplayMode;
  onChange: (value: ScatterDisplayMode) => void;
}

const items: SegmentedControlItem[] = [
  { id: 'both', label: 'Both' },
  { id: 'planned', label: 'Planned' },
  { id: 'actual', label: 'Actual' },
];

const ScatterChartControls: React.FC<ScatterChartControlsProps> = ({ value, onChange }) => {
  const { isFullscreen } = useFullscreen();

  if (!isFullscreen) {
    return null;
  }

  const handleChange = (item: SegmentedControlItem) => {
    onChange(item.id as ScatterDisplayMode);
  };

  return (
    <SegmentedMenu
      items={items}
      defaultActiveId={value}
      onChange={handleChange}
      className="scatter-chart-controls"
    />
  );
};

export default ScatterChartControls;
