import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { AttachedFile } from '../types/howTo.types';
import { useAttachedFiles } from './hooks/useAttachedFiles';
import FileUploader from '../../../common/FileUploader';

interface AttachedFilesListProps {
  files: AttachedFile[];
  isEditing: boolean;
  onFilesChange: (files: AttachedFile[]) => void;
}

/**
 * Component for displaying and managing attached files
 * Uses the useAttachedFiles hook for better separation of concerns
 */
const AttachedFilesList: React.FC<AttachedFilesListProps> = ({
  files,
  isEditing,
  onFilesChange,
}) => {
  const {
    newFileLabel,
    newFileUrl,
    addMethod,
    setNewFileLabel,
    setNewFileUrl,
    setAddMethod,
    handleAddUrlFile,
    handleFileUpload,
    handleRemoveFile,
    handleFileClick,
    updateFileLabel,
    updateFileUrl,
  } = useAttachedFiles(files, onFilesChange);

  // Don't render if there are no files and we're not in edit mode
  if (!files?.length && !isEditing) return null;

  return (
    <div className="bg-gray-50 rounded-lg px-4 py-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-24 w-24 text-titlePrimaryBlue" />
        <h3 className="font-medium text-lg m-0 text-titlePrimaryBlue">Attached Files</h3>
      </div>

      <div className="space-y-2 mb-4">
        {files?.map((file, index) => (
          <div key={index} className="flex items-center gap-2 p-2 mb-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  className="flex-1 p-1 text-lg border border-gray-300 rounded-md"
                  value={file.label}
                  onChange={(e) => updateFileLabel(index, e.target.value)}
                  placeholder="File label"
                />
                {!file.isLocal && (
                  <input
                    type="text"
                    className="flex-1 p-1 text-lg border border-gray-300 rounded-md"
                    value={file.url}
                    onChange={(e) => updateFileUrl(index, e.target.value)}
                    placeholder="File URL"
                  />
                )}
                {file.isLocal && (
                  <span className="flex-1 text-xs text-gray-500 italic px-2">
                    {file.file?.name || 'Uploaded file'}
                  </span>
                )}
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Remove file"
                >
                  <Trash2 className="h-24 w-24" />
                </button>
              </>
            ) : (
              <>
                <a
                  href={file.url}
                  onClick={(e) => handleFileClick(e, file.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-blue-600 hover:underline"
                >
                  {file.label || 'Attached file'}
                </a>
              </>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setAddMethod('url')}
                className={`px-3 py-1 rounded-md ${
                  addMethod === 'url' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Add URL
              </button>
              <button
                onClick={() => setAddMethod('file')}
                className={`px-3 py-1 rounded-md ${
                  addMethod === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Upload File
              </button>
            </div>

            {addMethod === 'url' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newFileLabel}
                  onChange={(e) => setNewFileLabel(e.target.value)}
                  placeholder="File label"
                />
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder="File URL"
                />
                <button
                  onClick={handleAddUrlFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={!newFileLabel || !newFileUrl}
                >
                  Add URL
                </button>
              </div>
            ) : (
              <FileUploader onFilesSelected={handleFileUpload} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachedFilesList;
