import { useState, useCallback, useEffect, useRef } from 'react';
import { ProcessedBenchmarkData } from '../../../types/benchmark';
import { useBenchmark } from '../../../BenchmarkContext';

export const useTableData = (
  data: ProcessedBenchmarkData[],
  onDataChange?: (updatedData: ProcessedBenchmarkData[]) => void
) => {
  const { state } = useBenchmark();
  const { excludedRows } = state;
  const [shouldRecalculate, setShouldRecalculate] = useState(false);
  // Track the last changed row
  const lastChangedRowRef = useRef<string | null>(null);
  // Track previous excluded rows to detect changes
  const prevExcludedRowsRef = useRef<Set<string>>(new Set());

  // Get the row code from an exclusion key
  const getRowCodeFromKey = (key: string): string => {
    return key.split('-')[0];
  };

  // Get the project code from an exclusion key
  const getProjectCodeFromKey = (key: string): string => {
    return key.split('-')[1];
  };

  // Find all parent codes for a given code
  const findParentCodes = useCallback((code: string): string[] => {
    const parts = code.split('.');
    const parentCodes: string[] = [];

    // Generate all parent codes
    for (let i = parts.length - 1; i > 0; i--) {
      const parentCode = parts.slice(0, i).join('.');
      parentCodes.push(parentCode);
    }

    return parentCodes;
  }, []);

  // Update the updateAffectedRows function to handle project exclusions
  const updateAffectedRows = useCallback(() => {
    if (!data.length) return;

    // Create a deep copy to ensure we're working with fresh data
    const dataCopy = JSON.parse(JSON.stringify(data));

    // If a project exclusion changed, we need to recalculate everything
    const recalculateAll = lastChangedRowRef.current === null;

    if (recalculateAll) {
      // Recalculate the entire hierarchy for all data
      const recalculateHierarchy = (items: ProcessedBenchmarkData[]) => {
        items.forEach((item) => {
          // First calculate this item's averages
          calculateRowAverage(item);

          // Recursively process children
          if (item.subRows && item.subRows.length > 0) {
            recalculateHierarchy(item.subRows);

            // After children are updated, recalculate parent totals
            updateParentFromChildren(item);
          }
        });
      };

      // Start the recalculation for all data
      recalculateHierarchy(dataCopy);
    } else {
      // Handle specific row exclusion
      const rowCode = getRowCodeFromKey(lastChangedRowRef.current!);
      const projectCode = getProjectCodeFromKey(lastChangedRowRef.current!);

      // Get all parent codes that need to be updated
      const parentCodes = findParentCodes(rowCode);
      const allCodesToUpdate = [rowCode, ...parentCodes];

      // Recalculate only affected rows
      const recalculateHierarchy = (items: ProcessedBenchmarkData[]) => {
        items.forEach((item) => {
          // Recalculate this item if it's in the affected codes
          if (allCodesToUpdate.includes(item.code)) {
            calculateRowAverage(item);
          }

          // Recursively process children
          if (item.subRows && item.subRows.length > 0) {
            recalculateHierarchy(item.subRows);

            // After children are updated, recalculate parent totals
            if (allCodesToUpdate.includes(item.code)) {
              updateParentFromChildren(item);
            }
          }
        });
      };

      // Start the recalculation
      recalculateHierarchy(dataCopy);
    }

    // Update the data
    onDataChange?.(dataCopy);

    // Reset for next update
    lastChangedRowRef.current = null;
  }, [data, onDataChange, excludedRows, findParentCodes, state.excludedProjects]);

  // Calculate averages for a single row based on its projects
  const calculateRowAverage = (row: ProcessedBenchmarkData): void => {
    // Skip rows with no projects
    if (!row.projects || Object.keys(row.projects).length === 0) {
      return;
    }

    let totalSum = 0;
    let rateSum = 0;
    let totalCount = 0;
    let rateCount = 0;

    // Process each project
    Object.entries(row.projects).forEach(([projectCode, projectData]) => {
      const key = `${row.code}-${projectCode}`;
      const isExcluded = excludedRows.has(key) || state.excludedProjects.has(projectCode);
      const isRateExcluded = state.excludedRates.has(projectCode);

      // Only include non-excluded projects for total
      if (!isExcluded) {
        totalSum += projectData.total || 0;
        totalCount++;

        // Only include non-excluded rates
        if (!isRateExcluded) {
          rateSum += projectData.ratePerXX || 0;
          rateCount++;
        }
      }
    });

    // Calculate new averages with proper precision
    row.average = {
      total: totalCount > 0 ? Number((totalSum / totalCount).toFixed(4)) : 0,
      ratePerXX: rateCount > 0 ? Number((rateSum / rateCount).toFixed(4)) : 0,
    };
  };

  // Update parent node based on children's values
  const updateParentFromChildren = (parent: ProcessedBenchmarkData): void => {
    if (!parent.subRows || parent.subRows.length === 0) return;

    // Get all project codes from children
    const allProjectCodes = new Set<string>();
    parent.subRows.forEach((child) => {
      Object.keys(child.projects).forEach((projectCode) => {
        allProjectCodes.add(projectCode);
      });
    });

    // For each project, calculate totals from children
    Array.from(allProjectCodes).forEach((projectCode) => {
      let totalSum = 0;
      let rateSum = 0;
      let totalCount = 0;
      let rateCount = 0;

      // Sum up values from non-excluded children
      parent.subRows.forEach((child) => {
        const childProject = child.projects[projectCode];
        const childKey = `${child.code}-${projectCode}`;
        const isChildExcluded =
          excludedRows.has(childKey) || state.excludedProjects.has(projectCode);
        const isRateExcluded = state.excludedRates.has(projectCode);

        if (childProject && !isChildExcluded) {
          totalSum += childProject.total;
          totalCount++;

          if (!isRateExcluded) {
            rateSum += childProject.ratePerXX;
            rateCount++;
          }
        }
      });

      // Update parent project values
      if (totalCount > 0) {
        parent.projects[projectCode] = {
          total: totalSum,
          // For rates, we're now summing instead of averaging
          ratePerXX: rateSum,
          excl: false,
        };
      } else {
        // If all children are excluded, mark parent as excluded too
        const parentKey = `${parent.code}-${projectCode}`;
        if (!excludedRows.has(parentKey)) {
          parent.projects[projectCode] = {
            total: 0,
            ratePerXX: 0,
            excl: true,
          };
        }
      }
    });

    // Recalculate parent averages
    calculateRowAverage(parent);
  };

  // Detect changes in excluded rows
  useEffect(() => {
    // Convert current and previous sets to arrays for comparison
    const currentExcluded = Array.from(excludedRows);
    const previousExcluded = Array.from(prevExcludedRowsRef.current);

    // Find items that were added or removed
    const added = currentExcluded.filter((item) => !previousExcluded.includes(item));
    const removed = previousExcluded.filter((item) => !currentExcluded.includes(item));

    // If there was a change
    if (added.length > 0 || removed.length > 0) {
      // Use the first changed item
      const changedItem = added.length > 0 ? added[0] : removed[0];
      lastChangedRowRef.current = changedItem;
      setShouldRecalculate(true);
    }

    // Update previous excluded rows reference
    prevExcludedRowsRef.current = new Set(excludedRows);
  }, [excludedRows]);

  // Perform the recalculation when needed
  useEffect(() => {
    if (shouldRecalculate) {
      updateAffectedRows();
      setShouldRecalculate(false);
    }
  }, [shouldRecalculate, updateAffectedRows]);

  // Update the useEffect for excludedProjects to trigger full recalculation
  useEffect(() => {
    // If any project exclusion changed, recalculate everything
    if (data.length > 0) {
      // Set lastChangedRowRef to null to indicate a full recalculation
      lastChangedRowRef.current = null;
      setShouldRecalculate(true);
    }
  }, [state.excludedProjects, data.length]);

  // Add effect to recalculate when excludedRates changes
  useEffect(() => {
    // If any rate exclusion changed, recalculate everything
    if (data.length > 0) {
      lastChangedRowRef.current = null;
      setShouldRecalculate(true);
    }
  }, [state.excludedRates, data.length]);

  return { setShouldRecalculate };
};
