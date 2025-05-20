import React, { useState, useEffect, useMemo } from 'react';
import { useBenchmarkFilters } from '../../context/BenchmarkFiltersContext';
import './RangeSlider.scss';
import type { FilterOptions } from '../../filters';

// Create a mapped type containing only keys from FilterOptions whose values are string[]
type FilterOptionsWithStringArrayValues = {
  [K in keyof FilterOptions as FilterOptions[K] extends string[] ? K : never]: FilterOptions[K];
};

// Extract the keys from the mapped type
type RangeFilterKey = keyof FilterOptionsWithStringArrayValues;

interface RangeSliderProps {
  filterKey: RangeFilterKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  showInputs?: boolean; // New prop to control whether to show input boxes
}

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  filterKey,
  label,
  min,
  max,
  step,
  unit = '',
  showInputs = true, // Default to showing inputs
}) => {
  // Hooks must be called at the top level
  const { activeFilters, setActiveFilters } = useBenchmarkFilters();
  const [localRange, setLocalRange] = useState<[number, number]>([min, max]);
  const [error, setError] = useState<Error | null>(null);

  // Debounce the local range to avoid too many updates
  const debouncedRange = useDebounce<[number, number]>(localRange, 300);

  // Calculate the percentage for positioning the knobs
  const minKnobPosition = useMemo(() => {
    return ((localRange[0] - min) / (max - min)) * 100;
  }, [localRange, min, max]);

  const maxKnobPosition = useMemo(() => {
    return ((localRange[1] - min) / (max - min)) * 100;
  }, [localRange, min, max]);

  // Initialize from active filters if available
  useEffect(() => {
    try {
      // Type safety: activeFilters[filterKey] is now known to be string[] | undefined
      const activeRange = activeFilters[filterKey];
      if (activeRange && activeRange.length === 2) {
        // Attempt to parse, handle potential NaN
        const parsedMin = parseInt(activeRange[0]);
        const parsedMax = parseInt(activeRange[1]);
        if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
          // Ensure parsed values are within the allowed min/max bounds
          const clampedMin = Math.max(min, Math.min(max, parsedMin));
          const clampedMax = Math.max(min, Math.min(max, parsedMax));
          // Ensure min <= max after clamping
          setLocalRange([Math.min(clampedMin, clampedMax), Math.max(clampedMin, clampedMax)]);
        } else {
          console.warn(`Invalid range values stored for ${filterKey}:`, activeRange);
          // Reset to default props min/max if parsing fails
          setLocalRange([min, max]);
        }
      } else {
        // If no active filter or invalid format, ensure local state is default
        setLocalRange([min, max]);
      }
    } catch (err) {
      console.error('Error initializing range filter:', err);
      setError(err as Error);
    }
    // Ensure min/max are included as dependency, as they define the default state
  }, [activeFilters, filterKey, min, max]);

  // Update active filters when debounced range changes
  useEffect(() => {
    try {
      const currentFilterValue = activeFilters[filterKey]; // Type is now string[] | undefined
      const isActiveFilterSet = currentFilterValue && currentFilterValue.length === 2;

      // Determine the current min/max values stored in activeFilters, defaulting to component props min/max if not set or invalid
      let activeMin = min;
      let activeMax = max;
      if (isActiveFilterSet) {
        const parsedMin = parseInt(currentFilterValue[0]);
        const parsedMax = parseInt(currentFilterValue[1]);
        if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
          // Use the valid parsed values from the active filter state
          activeMin = parsedMin;
          activeMax = parsedMax;
        } // else: keep props min/max as default if parsing fails
      }

      // Only update if the debounced range differs from the active filter state (or props min/max if not set/invalid)
      if (debouncedRange[0] !== activeMin || debouncedRange[1] !== activeMax) {
        // Check if the new range is different from the *component's* default min/max props
        const isRangeDefault = debouncedRange[0] === min && debouncedRange[1] === max;

        if (!isRangeDefault) {
          // If the range is not the default, update the active filter
          setActiveFilters({
            ...activeFilters,
            // Type safety: filterKey is guaranteed to be a key mapping to string[]
            [filterKey]: debouncedRange.map(String),
          });
        } else if (isActiveFilterSet) {
          // If the range *is* the default AND there was an active filter set previously,
          // remove the filter key to reset it.
          const newFilters = { ...activeFilters };
          // Type safety: delete is safe because filterKey is a known key of the correct type
          delete newFilters[filterKey];
          setActiveFilters(newFilters);
        } // else: Range is default and wasn't set before, no need to change activeFilters
      }
    } catch (err) {
      console.error('Error updating active filters:', err);
      setError(err as Error);
    }
  }, [debouncedRange, activeFilters, filterKey, setActiveFilters, min, max]);

  // Format value with thousands separator and unit
  const formatValue = (value: number): string => {
    return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  };

  const handleInputChange = (index: number, value: number) => {
    try {
      const newRange = [...localRange] as [number, number];

      // Clamp the input value to the overall min/max allowed by props
      const clampedValue = Math.max(min, Math.min(max, value));

      newRange[index] = clampedValue;

      // Ensure min <= max constraint within the local state
      if (index === 0 && clampedValue > newRange[1]) {
        newRange[1] = clampedValue; // If min is set higher than max, pull max up
      } else if (index === 1 && clampedValue < newRange[0]) {
        newRange[0] = clampedValue; // If max is set lower than min, push min down
      }

      // Ensure the other value also stays within bounds if adjusted
      newRange[0] = Math.max(min, Math.min(max, newRange[0]));
      newRange[1] = Math.max(min, Math.min(max, newRange[1]));

      setLocalRange(newRange);
    } catch (err) {
      console.error('Error changing range:', err);
      setError(err as Error);
    }
  };

  const handleClear = () => {
    try {
      setLocalRange([min, max]);

      // Remove this filter from active filters if it exists
      if (activeFilters[filterKey]) {
        const newFilters = { ...activeFilters };
        // Type safety: delete is now safe because filterKey is a known key
        delete newFilters[filterKey];
        setActiveFilters(newFilters);
      }
    } catch (err) {
      console.error('Error clearing range filter:', err);
      setError(err as Error);
    }
  };

  // Check if the filter is active (local range differs from props min/max)
  const isActive = useMemo(() => {
    return localRange[0] > min || localRange[1] < max;
  }, [localRange, min, max]);

  // If there's an error, show error state
  if (error) {
    return (
      <div className="range-slider range-slider--error">
        <div className="range-slider__header">
          <label className="range-slider__label">{label}</label>
        </div>
        <div className="range-slider__error-message">
          Error loading range slider. Please try again later.
        </div>
      </div>
    );
  }

  // Normal render
  return (
    <div className="range-slider">
      <div className="range-slider__header">
        <label className="range-slider__label">{label}</label>
        {isActive && (
          <button type="button" className="range-slider__clear" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {showInputs && (
        <div className="range-slider__inputs">
          <div className="range-slider__input-group">
            <input
              type="number"
              className="range-slider__input"
              value={localRange[0]}
              min={min}
              max={localRange[1]}
              step={step}
              onChange={(e) => handleInputChange(0, parseInt(e.target.value) || 0)}
              aria-label={`Minimum ${label}`}
            />
            {unit && <span className="range-slider__unit">{unit}</span>}
          </div>
          <span className="range-slider__separator">to</span>
          <div className="range-slider__input-group">
            <input
              type="number"
              className="range-slider__input"
              value={localRange[1]}
              min={localRange[0]}
              max={max}
              step={step}
              onChange={(e) => handleInputChange(1, parseInt(e.target.value) || 0)}
              aria-label={`Maximum ${label}`}
            />
            {unit && <span className="range-slider__unit">{unit}</span>}
          </div>
        </div>
      )}

      <div className="range-slider__values">
        <span className="range-slider__value">{formatValue(localRange[0])}</span>
        <span className="range-slider__value">{formatValue(localRange[1])}</span>
      </div>

      <div className="range-slider__track-container">
        <div className="range-slider__track">
          <div
            className="range-slider__track-fill"
            style={{
              left: `${minKnobPosition}%`,
              width: `${maxKnobPosition - minKnobPosition}%`,
            }}
          ></div>
          <input
            type="range"
            className="range-slider__input-min"
            value={localRange[0]}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleInputChange(0, parseInt(e.target.value) || 0)}
            aria-label={`Minimum ${label}`}
          />
          <input
            type="range"
            className="range-slider__input-max"
            value={localRange[1]}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleInputChange(1, parseInt(e.target.value) || 0)}
            aria-label={`Maximum ${label}`}
          />
        </div>
      </div>

      <div className="range-slider__range-info">
        <div>
          Range: {formatValue(min)} - {formatValue(max)}
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
