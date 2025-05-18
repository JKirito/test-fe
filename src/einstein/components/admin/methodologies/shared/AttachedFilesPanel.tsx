import React from 'react';
import { Trash2 } from 'lucide-react';
import { FileMetaData } from '../types'; // Updated import path

interface AttachedFilesPanelProps {
  files: FileMetaData[];
  onRemoveFile?: (fileId: string, nodeId: string, nodeType: 'regular' | 'step') => void;
  methodologies: {
    _id: string;
    nodeType: 'regular' | 'step';
    name: string;
    files: FileMetaData[];
  }[];
}

interface GroupedFiles {
  [docType: string]: {
    [nodeId: string]: {
      nodeName: string;
      files: FileMetaData[];
    };
  };
}

const AttachedFilesPanel: React.FC<AttachedFilesPanelProps> = ({
  files,
  onRemoveFile,
  methodologies,
}) => {
  const handleRemoveFile = (fileId: string) => {
    const node = methodologies.find((methodology) =>
      methodology.files.some((file) => file.fileId === fileId)
    );

    if (node && onRemoveFile) {
      onRemoveFile(fileId, node._id, node.nodeType);
    }
  };

  // Group files by docType and then by nodeId
  const groupedFiles = files.reduce((acc: GroupedFiles, file) => {
    const node = methodologies.find((methodology) =>
      methodology.files.some((f) => f.fileId === file.fileId)
    );

    if (node) {
      if (!acc[file.docType]) {
        acc[file.docType] = {};
      }
      if (!acc[file.docType][node._id]) {
        acc[file.docType][node._id] = {
          nodeName: node.name,
          files: [],
        };
      }
      acc[file.docType][node._id].files.push(file);
    }
    return acc;
  }, {});

  const orderedGroups = ['template', 'framework', 'example'].filter((type) => groupedFiles[type]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-base font-medium text-gray-600 p-4 border-b bg-gray-100">
        Existing Attachments
      </div>
      <div className="flex-1 overflow-auto p-4">
        {files.length > 0 ? (
          <div className="space-y-6">
            {orderedGroups.map((docType) => (
              <div key={docType} className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 capitalize flex items-center">
                  <span className="bg-activeOrange text-blue-700 px-2 py-1 rounded">
                    {docType}s (
                    {Object.values(groupedFiles[docType]).reduce(
                      (sum, node) => sum + node.files.length,
                      0
                    )}
                    )
                  </span>
                </h3>
                <div className="space-y-2">
                  {Object.entries(groupedFiles[docType]).map(([nodeId, { nodeName, files }]) => (
                    <div key={nodeId} className="border rounded-md">
                      <div className="w-full p-2 bg-gray-50 text-left border-b">
                        <span className="text-sm font-medium text-gray-700">{nodeName}</span>
                      </div>
                      <div>
                        {files.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 group"
                          >
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-700 hover:text-blue-600 text-sm truncate flex-1"
                            >
                              {file.originalFileName}
                            </a>
                            {onRemoveFile && (
                              <button
                                onClick={() => handleRemoveFile(file.fileId)}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50"
                                title="Remove file"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-white p-4 rounded-lg shadow-sm">
            No files attached to the selected tags.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachedFilesPanel;
