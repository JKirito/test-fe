'use client';

import type React from 'react';
import { useRef } from 'react';
import { X } from 'lucide-react';
import './SingleFileUpload.scss';

// --- Props Interface ---
interface SimpleFileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFileInfo?: { name: string } | null;
  buttonText?: string;
  accept?: string; // Allow specifying accepted file types
}

export default function SimpleFileUpload({
  onFileSelect,
  selectedFileInfo,
  buttonText = 'Choose File',
  accept = '.jpg,.jpeg,.png,.pdf,.xls,.xlsx,.xlsb,.xlsm', // Updated to include .xlsm
}: SimpleFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
      e.target.value = '';
    }
  };

  const handleFile = (file: File) => {
    // Basic validation (can be enhanced)
    const validTypes = accept.split(',').map((t) => t.trim());
    // Simple type check based on extension (more robust check might be needed)
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeTypeValid = validTypes.includes(file.type);
    const extensionValid = extension ? validTypes.includes(extension) : false;

    // Additional MIME type check for Excel files
    const excelMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ];
    const isExcelFile = excelMimeTypes.includes(file.type);

    if (!(mimeTypeValid || extensionValid || isExcelFile)) {
      alert(`Invalid file type. Please select one of: ${accept}`);
      onFileSelect(null);
      return;
    }

    // Size check (optional - maybe configure via prop?)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      onFileSelect(null);
      return;
    }

    // Pass valid file to parent
    onFileSelect(file);
  };

  const openFileSelector = () => {
    // Only allow opening if no file is selected
    if (!selectedFileInfo && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileSelect(null); // Signal removal to parent
  };

  // Dynamic class for file name display area
  const fileNameClass =
    `single-file-upload__file-name ${selectedFileInfo ? 'single-file-upload__file-name--selected' : ''}`.trim();
  // Class to disable button/container when file is selected
  const containerClass =
    `single-file-upload__container ${selectedFileInfo ? 'single-file-upload__container--disabled' : ''}`.trim();

  return (
    <div className="single-file-upload">
      <div className={containerClass}>
        <button
          type="button"
          onClick={openFileSelector}
          className="single-file-upload__button"
          disabled={!!selectedFileInfo} // Disable button when file selected
        >
          {buttonText}
        </button>
        <div className={fileNameClass}>
          {selectedFileInfo ? selectedFileInfo.name : 'No file selected'}
        </div>
        {/* Add Remove button inside the container when a file is selected */}
        {selectedFileInfo && (
          <button
            type="button"
            onClick={handleRemove}
            className="single-file-upload__remove-button"
            title="Remove file"
          >
            <X size={16} />
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="single-file-upload__input"
          accept={accept}
          onChange={handleFileInput}
          disabled={!!selectedFileInfo} // Disable input when file selected
        />
      </div>
    </div>
  );
}
