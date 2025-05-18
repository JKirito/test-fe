import React, { useState, useEffect } from 'react';
import { useBenchmarkFilters } from '../../context/BenchmarkFiltersContext';

interface RangeFilterProps {
  filterKey: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

const RangeFilter: React.FC<RangeFilterProps> = ({
  filterKey,
  label,
  min,
  max,
  step,
  unit = '',
}) => {
  const { activeFilters, setActiveFilters } = useBenchmarkFilters();
  const [localRange, setLocalRange] = useState<[number, number]>([min, max]);

  // Initialize from active filters if available
  useEffect(() => {
    const activeRange = activeFilters[filterKey] as string[] | undefined;
    if (activeRange && activeRange.length === 2) {
      setLocalRange([parseInt(activeRange[0]), parseInt(activeRange[1])]);
    }
  }, [activeFilters, filterKey]);

  const handleRangeChange = (index: number, value: number) => {
    const newRange = [...localRange] as [number, number];
    newRange[index] = value;
    
    // Ensure min <= max
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value;
    } else if (index === 1 && value < newRange[0]) {
      newRange[0] = value;
    }
    
    setLocalRange(newRange);
    
    // Update active filters
    setActiveFilters({
      ...activeFilters,
      [filterKey]: newRange.map(String),
    });
  };

  return (
    <div className="range-filter">
      <label className="range-filter__label">{label}</label>
      <div className="range-filter__inputs">
        <div className="range-filter__input-group">
          <input
            type="number"
            className="range-filter__input"
            value={localRange[0]}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleRangeChange(0, parseInt(e.target.value))}
          />
          {unit && <span className="range-filter__unit">{unit}</span>}
        </div>
        <span className="range-filter__separator">to</span>
        <div className="range-filter__input-group">
          <input
            type="number"
            className="range-filter__input"
            value={localRange[1]}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleRangeChange(1, parseInt(e.target.value))}
          />
          {unit && <span className="range-filter__unit">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default RangeFilter;
