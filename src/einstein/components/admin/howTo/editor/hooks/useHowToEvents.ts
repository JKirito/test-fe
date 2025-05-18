import { useEffect } from 'react';

/**
 * Custom hook for handling HowTo custom events
 */
export const useHowToEvents = (
  setParentId: (id: string | null) => void,
  setIsCreatingNew: (value: boolean) => void,
  setIsCreatingTopLevel: (value: boolean) => void
) => {
  // Event listener for creating new subsection
  useEffect(() => {
    const handleCreateNewSubsection = (event: CustomEvent) => {
      event.stopPropagation();
      const { parentId } = event.detail;

      // First reset all state
      setParentId(null);
      setIsCreatingNew(false);

      // Then set the new state after a small delay to ensure clean state
      setTimeout(() => {
        setParentId(parentId);
        setIsCreatingNew(true);
        // // console.log('Creating new subsection with parent ID:', parentId);
      }, 10);
    };

    window.addEventListener('createNewSubsection', handleCreateNewSubsection as EventListener);

    return () => {
      window.removeEventListener('createNewSubsection', handleCreateNewSubsection as EventListener);
    };
  }, [setParentId, setIsCreatingNew]);

  // Event listener for creating new top-level How-To
  useEffect(() => {
    const handleCreateNewTopLevelHowTo = (event: CustomEvent) => {
      event.stopPropagation();

      // First reset all state
      setIsCreatingTopLevel(false);
      setParentId(null);
      setIsCreatingNew(false);

      // Then set the new state after a small delay to ensure clean state
      setTimeout(() => {
        setIsCreatingTopLevel(true);
        // // console.log('Creating new top-level HowTo with filters:', event.detail.filters);
      }, 10);
    };

    window.addEventListener(
      'createNewTopLevelHowTo',
      handleCreateNewTopLevelHowTo as EventListener
    );

    return () => {
      window.removeEventListener(
        'createNewTopLevelHowTo',
        handleCreateNewTopLevelHowTo as EventListener
      );
    };
  }, [setIsCreatingTopLevel, setParentId, setIsCreatingNew]);
};
