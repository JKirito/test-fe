import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Link, X } from 'lucide-react';
import './FileUpload.scss';
// Import SegmentedMenu and its type
import { SegmentedMenu, SegmentedControlItem } from '@/components/segmented-menu/SegmentedMenu';

// Match the updated UploadMetadata from types.ts
interface UploadMetadata {
  type: 'file' | 'url';
  value: File | string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

// Corrected Props Interface
interface FileUploadProps {
  // Use onSelect for unified callback
  onSelect: (data: UploadMetadata | null) => void;
  // Use selectedData for unified selected item info
  selectedData?: UploadMetadata | null;
  buttonText?: string;
  descriptionText?: string;
}

// Define items for the SegmentedMenu
const fileUploadModes: SegmentedControlItem[] = [
  { id: 'file', label: 'Upload File' },
  { id: 'url', label: 'Enter URL' },
];

// Corrected function signature to use updated prop names
export default function FileUpload({
  onSelect,
  selectedData,
  buttonText = 'Upload File', // Keep defaults
  descriptionText = 'Excel, file size no more than 10MB', // Updated default
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInputValue('');
  }, [mode, selectedData]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      e.target.value = '';
    }
  };
  const handleFile = (selectedFile: File) => {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ];

    // Get file extension and check against accepted extensions
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.xls', '.xlsx', '.xlsb', '.xlsm'];

    // Check if either MIME type or extension is valid
    const mimeTypeValid = validTypes.includes(selectedFile.type);
    const extensionValid = validExtensions.includes(extension);

    if (!(mimeTypeValid || extensionValid)) {
      alert('Please upload a JPG, PNG, PDF or Excel file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    // Call onSelect with file metadata
    onSelect({
      type: 'file',
      value: selectedFile,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
    });
  };
  // Use selectedData in the condition
  const openFileSelector = () => {
    if (!selectedData && fileInputRef.current) fileInputRef.current.click();
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInputValue(e.target.value);
  };
  const handleUrlSubmit = () => {
    if (!urlInputValue || !urlInputValue.startsWith('http')) {
      alert('Please enter a valid URL starting with http or https');
      return;
    }
    // Call onSelect with URL metadata
    onSelect({ type: 'url', value: urlInputValue });
    setUrlInputValue('');
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(null);
  };

  // Handler for SegmentedMenu onChange
  const handleModeChange = (item: SegmentedControlItem) => {
    // Ensure the id is one of the expected modes before setting state
    if (item.id === 'file' || item.id === 'url') {
      setMode(item.id);
    }
  };

  // Use selectedData in the condition
  const dropzoneClass =
    `file-upload__dropzone ${isDragging ? 'file-upload__dropzone--dragging' : ''} ${selectedData ? 'file-upload__dropzone--disabled' : ''}`.trim();

  return (
    <div className="file-upload file-upload--with-modes">
      {selectedData ? (
        <div className="file-upload__info file-upload__info--selected">
          {selectedData.type === 'file' ? (
            // <FileText className="file-upload__info-icon" />
            <img src="/icons/document.svg" alt="Upload" className="file-upload__info-icon" />
          ) : (
            <Link className="file-upload__info-icon" />
          )}
          <span
            className="file-upload__info-text"
            title={
              selectedData.type === 'url' ? (selectedData.value as string) : selectedData.fileName
            }
          >
            {selectedData.type === 'file' && selectedData.fileName}
            {selectedData.type === 'url' &&
              typeof selectedData.value === 'string' &&
              selectedData.value}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="file-upload__remove-selected-button"
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="file-upload__modes-container">
          <SegmentedMenu
            items={fileUploadModes}
            defaultActiveId={mode}
            onChange={handleModeChange}
            className="file-upload__mode-selector"
          />

          {mode === 'file' ? (
            <div
              className={dropzoneClass}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileSelector}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openFileSelector();
              }}
            >
              <div className="file-upload__icon-wrapper">
                <img src="/icons/document-upload.svg" alt="Upload" />
              </div>
              <div>
                <h3 className="file-upload__title">Select a file or drag and drop here</h3>
                <p className="file-upload__description">{descriptionText}</p>
              </div>
              <button
                type="button"
                className="file-upload__button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileSelector();
                }}
              >
                {buttonText}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="file-upload__input"
                accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx,.xlsb,.xlsm"
                onChange={handleFileInput}
              />
            </div>
          ) : (
            <div className="file-upload__url-input-area">
              <input
                ref={urlInputRef}
                type="url"
                value={urlInputValue}
                onChange={handleUrlInputChange}
                placeholder="Enter URL (e.g., https://...)"
                className="file-upload__url-input"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="file-upload__url-submit-button"
                disabled={!urlInputValue}
              >
                Submit URL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
