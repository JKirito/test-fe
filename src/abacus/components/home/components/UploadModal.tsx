import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/tailwind';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  title: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSubmit, title }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if this is for an estimate upload
  const isEstimateUpload = title.toLowerCase().includes('estimate');

  // Set accept attribute based on upload type
  const acceptAttribute = isEstimateUpload ? '.xlsx,.xls,.xlsm,.csv' : undefined; // Allow any file type for attachments

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        // For estimate uploads, validate file type
        if (isEstimateUpload) {
          const file = files[0];
          const fileExt = file.name.split('.').pop()?.toLowerCase();
          if (fileExt && ['xlsx', 'xls', 'xlsm', 'csv'].includes(fileExt)) {
            setSelectedFile(file);
          } else {
            // Show error for invalid file type
            alert('Please upload a valid Excel or CSV file for estimates.');
          }
        } else {
          // For attachments, accept any file
          setSelectedFile(files[0]);
        }
      }
    },
    [isEstimateUpload]
  );

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        {/* Modal panel */}
        <div
          className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-md sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-titlePrimaryBlue" id="modal-title">
              {title}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={handleClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal content */}
          <div className="p-6">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragging
                  ? 'border-primaryBlue bg-primaryBlue/10'
                  : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-primaryBlue hover:bg-gray-50'
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={acceptAttribute}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <FileText size={48} className="text-green-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-2 text-center">
              {isEstimateUpload
                ? 'Supported file types: Excel (.xlsx, .xls, .xlsm), CSV'
                : 'All file types are supported for attachments'}
            </div>
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryBlue"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryBlue',
                selectedFile ? 'bg-primaryBlue hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
              )}
              onClick={handleSubmit}
              disabled={!selectedFile}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
