import { HowTo, AttachedFile } from '../../types/howTo.types';

/**
 * Custom hook for handling HowTo form data changes
 */
export const useHowToForm = (
  editedData: Partial<HowTo> | null,
  setEditedData: (data: Partial<HowTo> | null) => void
) => {
  // Handle title change
  const handleTitleChange = (title: string) => {
    if (editedData) {
      setEditedData({ ...editedData, title });
    }
  };

  // Handle description change (kept for backward compatibility)
  const handleDescriptionChange = (description: string) => {
    if (editedData) {
      setEditedData({ ...editedData, description });
    }
  };

  // Handle overview change
  const handleOverviewChange = (overview: string) => {
    if (editedData) {
      // Also update the plain text description for backward compatibility
      const plainTextDescription = overview.replace(/<[^>]*>/g, '');
      setEditedData({ ...editedData, overview, description: plainTextDescription });
    }
  };

  // Handle key information change
  const handleKeyInformationChange = (keyInformation: string) => {
    if (editedData) {
      setEditedData({ ...editedData, keyInformation });
    }
  };

  // Handle best practices change
  const handleBestPracticesChange = (bestPractices: string) => {
    if (editedData) {
      setEditedData({ ...editedData, bestPractices });
    }
  };

  // Handle rule of thumb change
  const handleRuleOfThumbChange = (ruleOfThumb: string) => {
    if (editedData) {
      setEditedData({ ...editedData, ruleOfThumb });
    }
  };

  // Handle attached files change
  const handleAttachedFilesChange = (attachedFiles: AttachedFile[]) => {
    if (editedData) {
      setEditedData({ ...editedData, attachedFiles });
    }
  };

  // Create form data for API submission
  const createFormData = (data: Partial<HowTo>): FormData => {
    // // console.log('[createFormData] Creating form data with:', data);
    const formData = new FormData();

    // Add basic data fields
    formData.append('title', data.title || '');
    formData.append('description', data.description || '');
    formData.append('overview', data.overview || '');
    formData.append('keyInformation', data.keyInformation || '');
    formData.append('bestPractices', data.bestPractices || '');
    formData.append('ruleOfThumb', data.ruleOfThumb || '');

    // Process attached files
    const fileMetadata: any[] = [];

    data.attachedFiles?.forEach((file, index) => {
      if (file.isLocal && file.file) {
        // Append actual file to FormData with a unique name
        formData.append(`files`, file.file, file.file.name);
        // Add metadata for this file
        fileMetadata.push({
          label: file.label,
          isLocal: true,
          fileName: file.file.name,
          fileIndex: index,
        });
      } else {
        // For remote URLs, just add the metadata
        fileMetadata.push({
          label: file.label,
          url: file.url,
          _id: file._id,
          isLocal: false,
        });
      }
    });

    // Add file metadata as JSON
    formData.append('fileMetadata', JSON.stringify(fileMetadata));

    // Add parent ID if provided
    if (data.parentId) {
      formData.append('parentId', data.parentId);
    }

    // Add filter IDs if available
    if (data.sector?._id) {
      // // console.log('[createFormData] Adding sector ID:', data.sector._id);
      formData.append('sector', data.sector._id);
    } else if (typeof data.sector === 'string') {
      // Handle case where sector is just a string ID
      // // console.log('[createFormData] Adding sector ID from string:', data.sector);
      formData.append('sector', data.sector);
    } else {
      // console.log('[createFormData] Missing sector ID in data:', data.sector);
    }

    // Add subsector if available
    if (data.subsector?._id) {
      // // console.log('[createFormData] Adding subsector ID:', data.subsector._id);
      formData.append('subsector', data.subsector._id);
    } else if (typeof data.subsector === 'string') {
      // Handle case where subsector is just a string ID
      // // console.log('[createFormData] Adding subsector ID from string:', data.subsector);
      formData.append('subsector', data.subsector);
    } else if (data.subsector) {
      // console.log('[createFormData] Missing subsector ID in data:', data.subsector);
    }

    if (data.buildType?._id) {
      // // console.log('[createFormData] Adding buildType ID:', data.buildType._id);
      formData.append('buildType', data.buildType._id);
    } else if (typeof data.buildType === 'string') {
      // Handle case where buildType is just a string ID
      // // console.log('[createFormData] Adding buildType ID from string:', data.buildType);
      formData.append('buildType', data.buildType);
    } else {
      // console.log('[createFormData] Missing buildType ID in data:', data.buildType);
    }

    // Add order if available
    if (data.order !== undefined && data.order !== null) {
      formData.append('order', data.order);
    }

    return formData;
  };

  return {
    handleTitleChange,
    handleDescriptionChange,
    handleOverviewChange,
    handleKeyInformationChange,
    handleBestPracticesChange,
    handleRuleOfThumbChange,
    handleAttachedFilesChange,
    createFormData,
  };
};
