import { useState } from 'react';
import { AttachedFile } from '../../types/howTo.types';
import apiClient from '@/lib/config/axiosConfig';

/**
 * Custom hook for managing attached files functionality
 */
export const useAttachedFiles = (
  files: AttachedFile[],
  onFilesChange: (files: AttachedFile[]) => void
) => {
  const [newFileLabel, setNewFileLabel] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [addMethod, setAddMethod] = useState<'url' | 'file'>('url');

  /**
   * Adds a file via URL
   */
  const handleAddUrlFile = () => {
    if (newFileLabel && newFileUrl) {
      onFilesChange([...files, { label: newFileLabel, url: newFileUrl }]);
      setNewFileLabel('');
      setNewFileUrl('');
    }
  };

  /**
   * Handles file upload from the FileUploader component
   */
  const handleFileUpload = (uploadedFiles: File[]) => {
    // Create new file objects with local URLs
    const newFiles = uploadedFiles.map((file) => ({
      file,
      label: file.name,
      url: URL.createObjectURL(file),
      isLocal: true,
    }));

    onFilesChange([...files, ...newFiles]);
  };

  /**
   * Removes a file at the specified index
   */
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];

    // If it's a local file, revoke the object URL to prevent memory leaks
    if (updatedFiles[index].isLocal) {
      URL.revokeObjectURL(updatedFiles[index].url);
    }

    updatedFiles.splice(index, 1);
    onFilesChange(updatedFiles);
  };

  /**
   * Checks if a URL is an Azure blob storage URL
   */
  const isAzureBlobUrl = (url: string): boolean => {
    return url.includes('blob.core.windows.net');
  };

  /**
   * Handles file link click and gets SAS URL for Azure blob storage
   */
  const handleFileClick = async (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    console.log('handleFileClick', url);

    if (isAzureBlobUrl(url)) {
      try {
        // Make API call to get SAS URL
        const response = await apiClient.get(`/how-to/files/url`, {
          params: { url },
        });

        // Check if we got a successful response with a sasUrl
        if (response.data && response.data.data && response.data.data.sasUrl) {
          // Open the SAS URL in a new tab
          window.open(response.data.data.sasUrl, '_blank');
        } else {
          console.error('Invalid response format from API:', response);
          // Fallback to opening the original URL
          window.open(url, '_blank');
        }
      } catch (error) {
        console.error('Error getting SAS URL:', error);
        // Fallback to opening the original URL
        window.open(url, '_blank');
      }
    } else {
      // For non-Azure URLs, open directly
      window.open(url, '_blank');
    }
  };

  /**
   * Updates file label at the specified index
   */
  const updateFileLabel = (index: number, label: string) => {
    const updatedFiles = [...files];
    updatedFiles[index].label = label;
    onFilesChange(updatedFiles);
  };

  /**
   * Updates file URL at the specified index
   */
  const updateFileUrl = (index: number, url: string) => {
    const updatedFiles = [...files];
    updatedFiles[index].url = url;
    onFilesChange(updatedFiles);
  };

  return {
    // State
    newFileLabel,
    newFileUrl,
    addMethod,

    // Setters
    setNewFileLabel,
    setNewFileUrl,
    setAddMethod,

    // Handlers
    handleAddUrlFile,
    handleFileUpload,
    handleRemoveFile,
    handleFileClick,
    updateFileLabel,
    updateFileUrl,
  };
};
