import React, { useEffect, useState } from 'react';
import EmptyState from './EmptyState';
import EditorContent from './EditorContent';
import NewHowToForm from './NewHowToForm';
import { useHowToEditor } from './hooks/useHowToEditor';
import { useHowToEvents } from './hooks/useHowToEvents';
import { useHowTo } from '../HowToContext';
import { HowTo } from '../types/howTo.types';

interface HowToEditorProps {
  onSaveComplete?: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  isCreating?: boolean;
}

/**
 * Main HowToEditor component that orchestrates all the editor subcomponents
 * using custom hooks for better separation of concerns
 */
const HowToEditor: React.FC<HowToEditorProps> = ({
  onSaveComplete,
  onSavingChange,
  isCreating: propIsCreating,
}) => {
  const {
    selectedHowTo,
    isEditing,
    editedData,
    isSaving,
    saveError,
    handleEdit,
    handleCancel,
    handleSave,
    handleDataChange,
    setIsCreatingNew,
    setIsCreatingTopLevel,
    setIsEditing,
  } = useHowToEditor();

  // Get context data needed for filter initialization
  const { appliedFilters, filterOptions, selectedFilters } = useHowTo();

  // Set up event listeners for custom events
  // Create a dummy function for setParentId since we don't use it anymore
  const setParentId = (id: string | null) => {
    // // console.log('[HowToEditor] setParentId called, but parentId state has been removed:', id);
  };
  useHowToEvents(setParentId, setIsCreatingNew, setIsCreatingTopLevel);

  // Track whether we've completed a save operation
  const [hasSaved, setHasSaved] = useState(false);

  // Call onSaveComplete only after a successful save operation
  useEffect(() => {
    // Only close the modal if we were previously saving and now we're not
    // AND there's no error AND we're no longer in edit mode
    if (hasSaved && !isSaving && !saveError && !isEditing && onSaveComplete) {
      onSaveComplete();
      setHasSaved(false); // Reset for next time
    }
  }, [hasSaved, isSaving, saveError, isEditing, onSaveComplete]);

  // Notify parent component about saving state changes
  useEffect(() => {
    if (onSavingChange) {
      onSavingChange(isSaving);
    }
  }, [isSaving, onSavingChange]);

  // Initialize state based on props
  useEffect(() => {
    // Initialize based on whether we are creating or editing
    // The key prop ensures this runs on a fresh instance
    // // console.log('[HowToEditor Init Effect]', {
    //   propIsCreating,
    //   selectedHowToId: selectedHowTo?._id,
    //   filterOptionsAvailable: !!filterOptions,
    //   appliedFilters,
    // });

    if (propIsCreating) {
      setIsEditing(true); // Enter edit mode immediately for creation

      // Determine initial data based on top-level or subsection
      const initialBlankData: Partial<HowTo> = {
        title: '',
        description: '',
        overview: '',
        keyInformation: '',
        bestPractices: '',
        ruleOfThumb: '',
        attachedFiles: [],
        order: '',
        parentId: null, // Default to null
      };

      if (selectedHowTo?._id) {
        // Creating a subsection: Inherit parent filters and set parentId
        initialBlankData.parentId = selectedHowTo._id;
        initialBlankData.sector = selectedHowTo.sector;
        initialBlankData.subsector = selectedHowTo.subsector;
        initialBlankData.buildType = selectedHowTo.buildType;
      } else if (filterOptions) {
        // // console.log(
        //   '[HowToEditor Init] Creating Top Level - Using selected filters:',
        //   selectedFilters
        // );

        // Find the corresponding filter options using the IDs
        if (selectedFilters.sector) {
          // Extract sectors from the tree structure
          const sectors = filterOptions.filter((item: any) => item.filterType === 'sector');
          const sectorOption = sectors.find((s: any) => s._id === selectedFilters.sector);
          if (sectorOption) {
            initialBlankData.sector = sectorOption;
          }
        }

        if (selectedFilters.subsector) {
          // Extract subsectors from the tree structure
          const subsectors = filterOptions.flatMap(
            (item: any) =>
              item.children?.filter((child: any) => child.filterType === 'subsector') || []
          );
          const subsectorOption = subsectors.find((s: any) => s._id === selectedFilters.subsector);
          if (subsectorOption) {
            initialBlankData.subsector = subsectorOption;
          }
        }

        if (selectedFilters.buildType) {
          // Extract buildTypes from the tree structure
          const buildTypes = filterOptions.flatMap(
            (item: any) =>
              item.children?.flatMap(
                (child: any) =>
                  child.children?.filter(
                    (grandchild: any) => grandchild.filterType === 'buildType'
                  ) || []
              ) || []
          );
          const buildTypeOption = buildTypes.find((b: any) => b._id === selectedFilters.buildType);
          if (buildTypeOption) {
            initialBlankData.buildType = buildTypeOption;
          }
        }
      }
      // // console.log('[HowToEditor Init] Final initialBlankData before set:', initialBlankData);
      handleDataChange(initialBlankData); // Set the initial data (with potentially undefined filters if lookups failed)
    } else if (selectedHowTo) {
      // If editing an existing item, prepare the data
      handleEdit();
    }
  }, [
    propIsCreating,
    selectedHowTo,
    handleEdit,
    handleDataChange, // Added handleDataChange dependency
    setIsEditing,
    // Removed state setters that are no longer needed here
    // setParentId,
    // setIsCreatingNew,
    // setIsCreatingTopLevel,
    // Add dependencies for context values used in top-level init
    appliedFilters,
    selectedFilters,
    filterOptions,
  ]);

  // Handle Cancel action
  const handleEditorCancel = () => {
    // // console.log('[handleEditorCancel] Cancelling editor and closing modal');
    handleCancel(); // Reset internal editor state
    if (onSaveComplete) {
      // // console.log('[handleEditorCancel] Calling onSaveComplete to close modal');
      onSaveComplete(); // Close the modal
    } else {
      // // console.log('[handleEditorCancel] Warning: onSaveComplete is not defined');
    }
  };

  // Wrap the original handleSave to set hasSaved flag
  const originalHandleSave = handleSave;
  const wrappedHandleSave = async () => {
    await originalHandleSave();
    setHasSaved(true);
  };

  // Render empty state if no How-To is selected and not creating a new one
  if (!selectedHowTo && !isEditing) {
    return <EmptyState />;
  }

  // Render new How-To form if creating a new top-level item
  if (!selectedHowTo && isEditing && editedData) {
    return (
      <NewHowToForm
        editedData={editedData}
        isSaving={isSaving}
        saveError={saveError}
        isTopLevel={true}
        onCancel={handleEditorCancel}
        onSave={wrappedHandleSave}
        onDataChange={handleDataChange}
      />
    );
  }

  // Render editor content if a How-To is selected
  return (
    <EditorContent
      selectedHowTo={selectedHowTo!}
      isEditing={isEditing}
      isSaving={isSaving}
      saveError={saveError}
      editedData={editedData}
      onEdit={handleEdit}
      onCancel={handleEditorCancel}
      onSave={wrappedHandleSave}
      onDataChange={handleDataChange}
    />
  );
};

export default HowToEditor;
