import { useAppSelector } from '@/lib/store/store';
import type { RootState } from '@/lib/store/store';
import { Loader } from 'lucide-react';
import { MethodsHeading } from '../methods-heading/methods-heading';
import { MethodsRecursive } from '../methods-recursive/methods-recursive';
import { useMethodSelection } from './hooks/useMethodSelection';
import { useMethodData } from './hooks/useMethodData';

interface MethodsContentProps {
  onProgressChange: (progress: number) => void;
  onMaxDepthChange?: (maxDepth: number) => void;
}

export const MethodsContent = ({ onProgressChange, onMaxDepthChange }: MethodsContentProps) => {
  // We don't need have this as a state because we have a fixed depth of 3, so use const
  //   const [maxDepth, setMaxDepth] = useState<number>(3); // Set fixed depth to 3
  const maxDepth = 3;

  // Get the Redux loading state for UI coordination
  const { loading: reduxLoading } = useAppSelector(
    (
      state: RootState & {
        methodologies: { methodologies: any[]; loading: boolean; error: string | null };
      }
    ) => state.methodologies
  );

  // Use our custom hook for handling selections
  const { selectedLevels, selectedOptions, getAccumulatedResources, handleSelect, onEdit } =
    useMethodSelection({ onProgressChange });

  // Use our custom hook for data fetching
  const { methodData, isLoadingTopLevel, topLevelError, levelQueries, topLevelData } =
    useMethodData({
      selectedLevels,
      getAccumulatedResources,
      onMaxDepthChange,
    });

  // Create a wrapper for handleSelect that passes in the data it needs
  const handleSelectWithData = (data: any, path: number[], currentDepth: number) => {
    const apiData = { topLevel: topLevelData };
    handleSelect(data, path, currentDepth, apiData, levelQueries);
  };

  if (isLoadingTopLevel || reduxLoading) {
    return (
      <div className="methods-list e-mg-t-32">
        <Loader />
      </div>
    );
  }

  if (topLevelError) {
    return (
      <div className="methods-list e-mg-t-32">
        Error loading methodologies: {(topLevelError as Error).message}
      </div>
    );
  }

  return (
    <div className="methods-list e-mg-t-32">
      <MethodsHeading
        maxDepth={maxDepth}
        depth={0}
        selectedOptions={selectedOptions}
        onEdit={() => onEdit(0)}
      />
      <div className="methods-list__container" style={{ width: '100%' }}>
        {Array.isArray(methodData) ? (
          methodData.map((section, pIndex) =>
            MethodsRecursive(
              section,
              [pIndex],
              maxDepth,
              handleSelectWithData,
              1,
              selectedOptions,
              onEdit
            )
          )
        ) : (
          <div>No methodology data available</div>
        )}
      </div>
    </div>
  );
};
