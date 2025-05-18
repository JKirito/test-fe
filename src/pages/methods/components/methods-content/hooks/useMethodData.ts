import { useMemo, useEffect } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useAppDispatch } from '@/lib/store/store';
import { fetchMethodologies } from '@/lib/store/methodologies/methodologiesSlice';
import { fetchTopLevelMethodologies, fetchChildMethodologies } from '../api/methodsApi';
import { mapApiResponseToMethodCards } from '../utils/methodsUtils';
import { LevelSelection } from '../api/types';
import { MockMethodCards } from '../../../methods.mock';
import { IMethodCard } from '../../../methods.models';

interface UseMethodDataProps {
  selectedLevels: LevelSelection[];
  getAccumulatedResources: (currentLevel: number) => {
    files: any[];
    experts: any[];
  };
  onMaxDepthChange?: (maxDepth: number) => void;
}

/**
 * Custom hook for fetching and processing methodology data
 */
export const useMethodData = ({
  selectedLevels,
  getAccumulatedResources,
  onMaxDepthChange,
}: UseMethodDataProps) => {
  const dispatch = useAppDispatch();

  // Initialize Redux store (for global state and other components that might need it)
  useEffect(() => {
    dispatch(fetchMethodologies());
  }, [dispatch]);

  // React Query for top-level methodologies
  const {
    data: topLevelResponse,
    isLoading: isLoadingTopLevel,
    error: topLevelError,
  } = useQuery({
    queryKey: ['methodologies', null],
    queryFn: fetchTopLevelMethodologies,
  });

  // Query for each selected level's children using useQueries
  const levelQueries = useQueries({
    queries: selectedLevels.map((level) => ({
      queryKey: ['methodologies', level.nodeId],
      queryFn: () => fetchChildMethodologies(level.nodeId),
      // Only enable for regular nodes, not step nodes
      enabled: level.nodeType === 'regular' || level.nodeType === 'service',
    })),
  });

  // Process top-level data
  useEffect(() => {
    if (topLevelResponse?.data) {
      // Always set max depth to 3 since there are only 3 levels
      if (onMaxDepthChange) {
        onMaxDepthChange(3);
      }
    }
  }, [topLevelResponse, onMaxDepthChange]);

  // Prepare data for rendering
  const methodData = useMemo(() => {
    if (!topLevelResponse?.data) return MockMethodCards;

    // Filter top-level nodes (parentId === null)
    const topLevelNodes = topLevelResponse.data.filter((node) => node.parentId === null);
    const mappedNodes = mapApiResponseToMethodCards(topLevelNodes);

    // Build the hierarchical structure
    // Make a deep copy to avoid mutating the original data
    const tree = JSON.parse(JSON.stringify(mappedNodes)) as IMethodCard[];

    // Process each level selection to add children
    selectedLevels.forEach((level, levelIndex) => {
      // Only process level 1 and 2 selections for building the tree
      if (levelIndex > 1) return; // Skip level 3

      const query = levelQueries[levelIndex];
      if (!query?.data?.data || !Array.isArray(query.data.data)) {
        return;
      }

      // Get accumulated files and experts up to this level
      const { files: accumulatedFiles, experts: accumulatedExperts } =
        getAccumulatedResources(levelIndex);

      // Map the children with accumulated files and experts
      const children = mapApiResponseToMethodCards(
        query.data.data,
        accumulatedFiles,
        accumulatedExperts
      );

      // Find the parent node in the tree and attach children
      if (levelIndex === 0) {
        // First level: direct access by index
        const parentIndex = level.path[0];
        if (tree[parentIndex]) {
          tree[parentIndex].children = children;
        }
      } else {
        // Find parent in deeper levels by traversing the path
        let currentLevel = tree;
        let currentNode: IMethodCard | undefined = undefined;

        // Traverse the path to find the parent node
        for (let i = 0; i < level.path.length; i++) {
          const idx = level.path[i];
          if (currentLevel && currentLevel[idx]) {
            currentNode = currentLevel[idx];
            currentLevel = currentNode.children || [];
          } else {
            break;
          }
        }

        // Attach children to the found parent
        if (currentNode) {
          currentNode.children = children;
        }
      }
    });

    return tree;
  }, [topLevelResponse, selectedLevels, levelQueries, getAccumulatedResources]);

  return {
    methodData,
    isLoadingTopLevel,
    topLevelError,
    levelQueries,
    topLevelData: topLevelResponse?.data,
  };
};
