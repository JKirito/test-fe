import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface FileUploaderProps {
  onChange: (files: File[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onChange }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [
    '.doc',
    '.docx', // Microsoft Word
    '.pdf', // PDF
    '.txt', // Text files
    '.rtf', // Rich Text Format
    '.odt', // OpenDocument Text
    '.xls',
    '.xlsx', // Microsoft Excel
    '.ppt',
    '.pptx', // Microsoft PowerPoint
    '.csv', // CSV files
    '.md', // Markdown
  ].join(',');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onChange(updatedFiles);

    // Reset the file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedFiles);
    onChange(updatedFiles);
  };

  return (
    <div className="mt-4">
      <div className="text-base font-medium text-gray-600 mb-2">Upload Documents</div>
      <div className="flex flex-col gap-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={acceptedFileTypes}
          />
          <p className="text-sm text-gray-600">Click to browse or drag and drop documents here</p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: Word, Excel, PowerPoint, PDF, Text, RTF, CSV
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Selected files:</p>
            <div className="bg-white rounded-lg shadow divide-y">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
