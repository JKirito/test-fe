import { useState, useEffect, useCallback } from 'react';
import { useHowTo } from '../../HowToContext';
import { HowTo } from '../../types/howTo.types';
import apiClient from '@/lib/config/axiosConfig';
import { useHowToForm } from './useHowToForm';

/**
 * Custom hook for managing the HowTo editor state and operations
 */
export const useHowToEditor = () => {
  const { selectedHowTo, refreshHowTos, filterOptions, selectedFilters } = useHowTo();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<HowTo> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoEdit, setAutoEdit] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isCreatingTopLevel, setIsCreatingTopLevel] = useState(false);

  // Use the form hook for handling form data changes
  const { createFormData } = useHowToForm(editedData, setEditedData);

  // Reset state when component mounts
  useEffect(() => {
    // Reset all state when component mounts
    setEditedData(null);
    setIsEditing(false);
    setSaveError(null);
    setIsCreatingNew(false);
    setIsCreatingTopLevel(false);

    // Also reset state when component unmounts
    return () => {
      setEditedData(null);
      setIsEditing(false);
      setSaveError(null);
      setIsCreatingNew(false);
      setIsCreatingTopLevel(false);
    };
  }, []);

  // Effect for handling URL parameters and selected How-To changes
  useEffect(() => {
    if (selectedHowTo) {
      setEditedData(null);
      setIsEditing(false);
      setSaveError(null);

      const urlParams = new URLSearchParams(window.location.search);

      // Check if we should enter edit mode
      if (urlParams.get('edit') === 'true') {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        setAutoEdit(true);
      }

      // Check if we should create a new subsection
      if (urlParams.get('createNew') === 'true') {
        const parentIdParam = urlParams.get('parentId');
        if (parentIdParam) {
          setIsCreatingNew(true);

          // Clear URL parameters
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    }
  }, [selectedHowTo]);

  // Handle edit button click / initialize for edit - wrapped in useCallback
  const handleEdit = useCallback(() => {
    if (selectedHowTo) {
      // Add _id to editedData when editing
      // Set editedData directly based on the selected item
      setEditedData({
        _id: selectedHowTo._id,
        title: selectedHowTo.title,
        description: selectedHowTo.description,
        overview: selectedHowTo.overview || selectedHowTo.description, // Use description as fallback
        keyInformation: selectedHowTo.keyInformation,
        bestPractices: selectedHowTo.bestPractices,
        ruleOfThumb: selectedHowTo.ruleOfThumb,
        attachedFiles: selectedHowTo.attachedFiles ? [...selectedHowTo.attachedFiles] : [],
        order: selectedHowTo.order?.toString() ?? '', // Initialize order from selected item or default
        sector: selectedHowTo.sector,
        subsector: selectedHowTo.subsector,
        buildType: selectedHowTo.buildType,
        // lifecycle removed
      });
      setIsEditing(true); // Ensure edit mode is active
    }
  }, [selectedHowTo, setIsEditing, setEditedData]);

  // Automatically start editing when selecting an existing item, but skip during creation flows
  useEffect(() => {
    if (
      selectedHowTo &&
      !isEditing &&
      !isCreatingNew &&
      !isCreatingTopLevel
    ) {
      handleEdit();
    }
  }, [selectedHowTo, isEditing, isCreatingNew, isCreatingTopLevel, handleEdit]);

  // Handle auto edit mode
  useEffect(() => {
    if (autoEdit && selectedHowTo) {
      handleEdit();
      setAutoEdit(false);
    }
  }, [autoEdit, selectedHowTo]);

  // Handle cancel button click - wrapped in useCallback
  const handleCancel = useCallback(() => {
    // Reset all state
    setIsEditing(false);
    setEditedData(null);
    setSaveError(null);
    setIsCreatingNew(false);
    setIsCreatingTopLevel(false);
  }, [setIsEditing, setEditedData, setSaveError, setIsCreatingNew, setIsCreatingTopLevel]);

  // Handle data changes - wrapped in useCallback
  const handleDataChange = useCallback(
    (data: Partial<HowTo>) => {
      setEditedData(data);
    },
    [setEditedData]
  );

  // Handle save button click - wrapped in useCallback
  const handleSave = useCallback(async () => {
    if (!editedData) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Use the createFormData function from useHowToForm
      const formData = createFormData(editedData);

      // Log the form data for debugging
      // // console.log('[handleSave] Form data entries:');
      // for (const [key, value] of formData.entries()) {
      //   // console.log(`${key}: ${value}`);
      // }

      // Determine if creating (POST) or updating (PUT)
      if (editedData._id) {
        // Updating existing item
        // // console.log('Updating how-to with FormData:', editedData._id);
        await apiClient.put(`/how-to/${editedData._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Creating new item (top-level or subsection handled by backend via parentId in formData)
        // // console.log('Creating new how-to with FormData');
        await apiClient.post('/how-to', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      await refreshHowTos();
      setIsEditing(false);
      setEditedData(null);
      // setParentId(null); // parentId state removed
      // Note: We don't need to close the modal here, as the useEffect in the HowToEditor component will handle that
    } catch (error) {
      console.error('Error saving how-to:', error);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [
    editedData,
    createFormData,
    refreshHowTos,
    setIsEditing,
    setEditedData,
    setSaveError,
    setIsSaving,
  ]);

  return {
    // State
    selectedHowTo,
    isEditing,
    editedData,
    isSaving,
    saveError,

    // Actions
    handleEdit,
    handleCancel,
    handleSave,
    handleDataChange,

    // Setters
    setIsEditing,
    setIsCreatingNew,
    setIsCreatingTopLevel,
  };
};
