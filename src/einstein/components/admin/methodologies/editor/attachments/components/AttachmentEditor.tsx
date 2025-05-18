import React, { FC, useState, useRef, ChangeEvent, useEffect } from 'react';
import { FileUp, Link, Plus } from 'lucide-react';

export interface DocumentType {
  id: string;
  name: string;
}

interface AttachmentEditorProps {
  documentTypes: DocumentType[];
  onAddFile: (file: File, displayName: string, documentTypeId: string) => void;
  onAddUrl: (url: string, displayName: string, documentTypeId: string) => void;
}

export const AttachmentEditor: FC<AttachmentEditorProps> = ({
  documentTypes,
  onAddFile,
  onAddUrl,
}) => {
  const [attachmentType, setAttachmentType] = useState<'file' | 'url'>('file');
  const [documentTypeId, setDocumentTypeId] = useState<string>(documentTypes[0]?.id || '');
  const [displayName, setDisplayName] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [hasFile, setHasFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default document type if available
  useEffect(() => {
    if (!documentTypeId && documentTypes.length > 0) {
      setDocumentTypeId(documentTypes[0].id);
    }
  }, [documentTypes]);

  const resetForm = () => {
    setDisplayName('');
    setUrl('');
    setHasFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setHasFile(true);
      if (!displayName) {
        // Use filename as default display name
        setDisplayName(file.name.split('.')[0]);
      }
    } else {
      setHasFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentTypeId) {
      return;
    }

    if (attachmentType === 'file' && fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      onAddFile(file, displayName || file.name.split('.')[0], documentTypeId);
      resetForm();
    } else if (attachmentType === 'url' && url) {
      onAddUrl(url, displayName || url, documentTypeId);
      resetForm();
    }
  };

  // Calculate if button should be disabled
  const isSubmitDisabled =
    !documentTypeId ||
    (attachmentType === 'file' && !hasFile) ||
    (attachmentType === 'url' && !url);

  return (
    <div className="mb-24 bg-grayscale-50 rounded-8 p-24">
      <h3 className="text-lg font-semibold text-grayscale-900 mb-16">Add Attachment</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-16">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex flex-col flex-1 min-w-0">
            <label htmlFor="documentType" className="mb-8 text-sm font-medium text-grayscale-700">
              Document Type
            </label>
            <select
              id="documentType"
              className="px-12 py-8 border border-grayscale-300 rounded-4 w-full focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={documentTypeId}
              onChange={(e) => setDocumentTypeId(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <label htmlFor="displayName" className="mb-8 text-sm font-medium text-grayscale-700">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              className="px-12 py-8 border border-grayscale-300 rounded-4 w-full focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name for attachment"
            />
          </div>
        </div>

        <div className="flex gap-8">
          <button
            type="button"
            className={`flex items-center gap-6 px-16 py-8 border rounded-4 text-sm transition-colors ${
              attachmentType === 'file'
                ? ' bg-primary-500 text-white'
                : ' border-grayscale-950 bg-white text-grayscale-950 hover:bg-grayscale-50'
            }`}
            onClick={() => setAttachmentType('file')}
          >
            <FileUp size={16} />
            <span className={`${attachmentType === 'file' ? 'text-white' : 'text-grayscale-700'}`}>
              Upload File
            </span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-6 px-16 py-8 border rounded-48 text-sm transition-colors ${
              attachmentType === 'url'
                ? ' bg-primary-500 text-white'
                : 'border-grayscale-300 bg-white text-grayscale-700 hover:bg-grayscale-50'
            }`}
            onClick={() => setAttachmentType('url')}
          >
            <Link size={16} />
            <span className={`${attachmentType === 'url' ? 'text-white' : 'text-grayscale-700'}`}>
              Add Link / Url
            </span>
          </button>
        </div>

        {attachmentType === 'file' ? (
          <div className="flex flex-col">
            <label htmlFor="fileUpload" className="mb-8 text-sm font-medium text-grayscale-700">
              File
            </label>
            <input
              type="file"
              id="fileUpload"
              className="text-sm text-grayscale-700 file:mr-12 file:py-6 file:px-12 file:rounded-48 file:border-0 file:text-sm file:bg-primary-500 file:text-white hover:file:bg-primary-600"
              onChange={handleFileChange}
              ref={fileInputRef}
              required
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <label htmlFor="urlInput" className="mb-8 text-sm font-medium text-grayscale-700">
              Link / Url
            </label>
            <input
              type="url"
              id="urlInput"
              className="px-12 py-8 border border-grayscale-300 rounded-4 w-full focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              required
            />
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="flex items-center gap-6 px-16 py-8 bg-primary-500 text-white font-medium rounded-48 hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitDisabled}
          >
            <Plus size={16} />
            Add Attachment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttachmentEditor;
