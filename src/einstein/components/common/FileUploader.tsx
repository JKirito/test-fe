import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

/**
 * Reusable file upload component with drag and drop functionality
 */
const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles drag over event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handles drag leave event
   */
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  /**
   * Handles file drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  /**
   * Handles file input change event
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
    }
  };

  /**
   * Triggers the file input click
   */
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
      />
      <div className="flex flex-col items-center justify-center">
        <Plus className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 mb-2">
          Drag and drop files here, or click to select files
        </p>
        <button
          onClick={triggerFileInput}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Select Files
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
