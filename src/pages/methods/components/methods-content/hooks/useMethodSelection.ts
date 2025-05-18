import { useState, useCallback } from 'react';
import { LevelSelection } from '../api/types';
import { IMethodCard } from '../../../methods.models';
import { ApiMethodologyItem, ApiExpert, ApiFile } from '../api/types';

interface UseMethodSelectionProps {
  onProgressChange: (progress: number) => void;
}

/**
 * Custom hook for managing methodology selections
 */
export const useMethodSelection = ({ onProgressChange }: UseMethodSelectionProps) => {
  const [selectedLevels, setSelectedLevels] = useState<LevelSelection[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [forcedProgress, setForcedProgress] = useState<number | null>(null);

  // Function to get accumulated files and experts up to a specific level
  const getAccumulatedResources = useCallback(
    (currentLevel: number) => {
      // Combine files from all previous levels and current level
      const allFiles = selectedLevels
        .slice(0, currentLevel + 1)
        .reduce((acc, level) => [...acc, ...(level.files || [])], [] as ApiFile[]);

      // Remove duplicates based on fileId
      const uniqueFiles = allFiles.filter(
        (file, idx, self) => idx === self.findIndex((f) => f.fileId === file.fileId)
      );

      // Combine experts from all previous levels and current level
      const allExperts = selectedLevels
        .slice(0, currentLevel + 1)
        .reduce((acc, level) => [...acc, ...(level.experts || [])], [] as ApiExpert[]);

      // Remove duplicates based on id or name
      const uniqueExperts = allExperts.filter((expert, idx, self) => {
        if (expert._id) {
          return idx === self.findIndex((e) => e._id === expert._id);
        }
        if (expert.name) {
          return idx === self.findIndex((e) => e.name === expert.name);
        }
        return true;
      });

      return { files: uniqueFiles, experts: uniqueExperts };
    },
    [selectedLevels]
  );

  // Handle selection of a methodology item
  const handleSelect = useCallback(
    (
      data: IMethodCard,
      path: number[],
      currentDepth: number,
      apiData: { [key: string]: ApiMethodologyItem[] | undefined },
      levelQueries: any[]
    ) => {
      // console.log('handleSelect called with:', { data, path, currentDepth });

      // If we're at level 3, set forcedProgress to 3 and add to selected options
      if (currentDepth === 3) {
        // console.log('At level 3, updating progress to 3');

        // Store the level 3 selection in state
        if (!selectedLevels[2]) {
          // If we don't have a level 3 selection yet
          let node: ApiMethodologyItem | undefined;

          if (levelQueries[1]?.data) {
            node = levelQueries[1].data.data.find((n: ApiMethodologyItem) => n._id === data.id);
          }

          if (node) {
            // Get accumulated resources from previous levels
            const { files: prevFiles, experts: prevExperts } =
              selectedLevels.length > 0
                ? getAccumulatedResources(selectedLevels.length - 1)
                : { files: [], experts: [] };

            const newSelection: LevelSelection = {
              nodeId: node._id,
              nodeType: node.nodeType,
              nextLevelName: node.nextLevelName,
              data,
              path,
              files: [...prevFiles, ...(node.files || [])],
              experts: [...prevExperts, ...(node.experts || [])],
            };

            // Add to selected levels
            setSelectedLevels((prev) => {
              // Make sure we have level 1 and 2 selections before adding level 3
              if (prev.length < 2) return prev;
              return [...prev, newSelection];
            });

            // Add to selected options
            setSelectedOptions((prev) => {
              if (prev.length < 2) return prev;
              return [...prev, { data, path: path.join('-') }];
            });
          }
        }

        // Force progress to 3 (this takes precedence over the length of selectedLevels)
        setForcedProgress(3);
        onProgressChange(3);
        return;
      }

      // Clear forced progress since we're handling a regular selection
      setForcedProgress(null);

      // For levels 1 and 2, check if we already have a selection at this depth
      if (selectedLevels[currentDepth - 1]) {
        // console.log('Already have selection at depth', currentDepth);
        return;
      }

      // Get the node from the appropriate query result based on the level
      let node: ApiMethodologyItem | undefined;

      if (currentDepth === 1) {
        // Top level selection
        const topLevelData = apiData['topLevel'];
        if (topLevelData) {
          node = topLevelData.find((n: ApiMethodologyItem) => n._id === data.id);
        }
      } else if (currentDepth === 2 && levelQueries[currentDepth - 2]?.data) {
        // Level 2 selection (adjusting index because levelQueries is 0-indexed)
        node = levelQueries[currentDepth - 2].data.data.find(
          (n: ApiMethodologyItem) => n._id === data.id
        );
      }

      if (!node) {
        console.error('Node not found for selection:', { data, currentDepth });
        return;
      }

      // Get accumulated resources from previous levels
      const { files: prevFiles, experts: prevExperts } =
        currentDepth > 1 ? getAccumulatedResources(currentDepth - 2) : { files: [], experts: [] };

      // Create new level selection
      const newSelection: LevelSelection = {
        nodeId: node._id,
        nodeType: node.nodeType,
        nextLevelName: node.nextLevelName,
        data,
        path,
        files: [...prevFiles, ...(node.files || [])],
        experts: [...prevExperts, ...(node.experts || [])],
      };

      // Remove any selections after the current level
      setSelectedLevels((prev) => {
        const updatedLevels = prev.slice(0, currentDepth - 1);
        updatedLevels.push(newSelection);
        return updatedLevels;
      });

      // Update selected options for UI
      setSelectedOptions((prev) => {
        const updatedOptions = prev.slice(0, currentDepth - 1);
        updatedOptions.push({ data, path: path.join('-') });
        return updatedOptions;
      });

      // Update progress
      onProgressChange(currentDepth);
    },
    [getAccumulatedResources, selectedLevels, onProgressChange]
  );

  // Handle editing/removing a level selection
  const onEdit = useCallback(
    (index: number) => {
      // console.log('onEdit called with index:', index);
      // Clear selections after this index
      setSelectedLevels((prev) => prev.slice(0, index));
      setSelectedOptions((prev) => prev.slice(0, index));
      // Clear forced progress when editing
      setForcedProgress(null);
      // Update progress
      onProgressChange(index);
    },
    [onProgressChange]
  );

  return {
    selectedLevels,
    selectedOptions,
    forcedProgress,
    getAccumulatedResources,
    handleSelect,
    onEdit,
  };
};
