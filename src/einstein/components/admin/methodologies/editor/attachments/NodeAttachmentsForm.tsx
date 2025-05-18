import React, { useState, useEffect } from 'react';
import { Plus, Loader } from 'lucide-react';
import { FileMetaData } from '../../types';
import Button from '@/einstein/components/common/Button';

// Import sub-components
import { ExistingAttachments, ExistingAttachment } from './components/ExistingAttachments';
import { PendingAttachments, PendingAttachment } from './components/PendingAttachments';
import { AttachmentEditor, DocumentType } from './components/AttachmentEditor';

interface NodeAttachmentsFormProps {
  files: FileMetaData[];
  onRemoveFile: (fileId: string) => Promise<void>;
  onFileSelection: (files: File[]) => void;
  onUrlDataChange: (urlData: { url: string; originalFileName: string }) => void;
  selectedFiles: File[];
  uploadType: 'document' | 'url';
  urlData: { url: string; originalFileName: string };
  onUploadTypeChange: (type: 'document' | 'url') => void;
  documentType: 'framework' | 'template' | 'example';
  onDocumentTypeChange: (type: 'framework' | 'template' | 'example') => void;
  isSubmitting?: boolean;
}

const NodeAttachmentsForm: React.FC<NodeAttachmentsFormProps> = ({
  files,
  onRemoveFile,
  onFileSelection,
  onUrlDataChange,
  selectedFiles,
  onUploadTypeChange,
  documentType,
  onDocumentTypeChange,
  isSubmitting = false,
}) => {
  const [isAddingAttachment, setIsAddingAttachment] = useState<boolean>(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

  // Map files to ExistingAttachment format
  const existingAttachments: ExistingAttachment[] = files.map((file) => ({
    id: file.fileId,
    displayName: file.originalFileName,
    fileName: file.originalFileName,
    documentTypeName: file.docType.charAt(0).toUpperCase() + file.docType.slice(1),
    documentTypeId: file.docType,
  }));

  // Map document types for the AttachmentEditor
  const documentTypes: DocumentType[] = [
    { id: 'framework', name: 'Framework' },
    { id: 'template', name: 'Template' },
    { id: 'example', name: 'Best Practice Examples' },
  ];

  // Sync selected files with parent component when pendingAttachments changes
  useEffect(() => {
    // Extract files from pendingAttachments
    const fileAttachments = pendingAttachments
      .filter((attachment) => attachment.file)
      .map((attachment) => {
        // Add display name as a custom property to the file object
        const fileWithMeta = attachment.file as any;
        if (fileWithMeta) {
          fileWithMeta.displayName = attachment.displayName;
          fileWithMeta.documentTypeId = attachment.documentTypeId;
        }
        return fileWithMeta;
      });

    // Update parent component with latest files
    onFileSelection(fileAttachments);

    // Handle URL attachments - extract all URLs
    const urlAttachments = pendingAttachments.filter((attachment) => attachment.url);

    if (urlAttachments.length > 0) {
      // If we have URL attachments, set upload type to URL
      onUploadTypeChange('url');

      // For API compatibility, we'll still send only the latest URL through the urlData interface
      // This is to avoid breaking existing API integrations
      const latestUrlAttachment = urlAttachments[urlAttachments.length - 1];
      onUrlDataChange({
        url: latestUrlAttachment.url || '',
        originalFileName: latestUrlAttachment.displayName,
      });
    } else if (pendingAttachments.some((attachment) => attachment.file)) {
      // If we have file attachments but no URLs, set upload type to document
      onUploadTypeChange('document');
    }
  }, [pendingAttachments]);

  const handleAddAttachment = () => {
    setIsAddingAttachment(true);
  };

  const handleAddFile = (file: File, displayName: string, documentTypeId: string) => {
    const newAttachment: PendingAttachment = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      displayName,
      documentTypeId,
      documentTypeName: documentTypeId.charAt(0).toUpperCase() + documentTypeId.slice(1),
      file,
    };

    // Always add the new file to the existing pending attachments
    setPendingAttachments([...pendingAttachments, newAttachment]);

    // Update the current document type in the parent component
    onDocumentTypeChange(documentTypeId as 'framework' | 'template' | 'example');
  };

  const handleAddUrl = (url: string, displayName: string, documentTypeId: string) => {
    const newAttachment: PendingAttachment = {
      id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      displayName,
      documentTypeId,
      documentTypeName: documentTypeId.charAt(0).toUpperCase() + documentTypeId.slice(1),
      url,
    };

    // Add the new URL to existing attachments instead of replacing
    setPendingAttachments([...pendingAttachments, newAttachment]);

    // Update the current document type in the parent component
    onDocumentTypeChange(documentTypeId as 'framework' | 'template' | 'example');
  };

  const handleRemoveExistingAttachment = async (attachmentId: string) => {
    await onRemoveFile(attachmentId);
  };

  const handleRemovePendingAttachment = (attachmentId: string) => {
    setPendingAttachments(pendingAttachments.filter((a) => a.id !== attachmentId));
  };

  const handleCancelAdd = () => {
    setIsAddingAttachment(false);
    setPendingAttachments([]);
    // Reset parent component state
    onFileSelection([]);
    onUrlDataChange({ url: '', originalFileName: '' });
  };

  return (
    <div className="mb-24">
      <div className="flex justify-between items-center mb-16">
        <h3 className="text-lg font-semibold text-grayscale-900 m-0">Attached Files</h3>
        {!isAddingAttachment && !isSubmitting && (
          <Button
            variant="secondary"
            onClick={handleAddAttachment}
            text="Add Attachment"
            icon={<Plus size={16} />}
          />
        )}
      </div>

      {isSubmitting && (
        <div className="flex items-center gap-12 p-16 bg-primary-50 rounded-4 mb-16 text-primary-700 font-medium">
          <Loader size={24} className="animate-spin" />
          <span>Uploading attachments...</span>
        </div>
      )}

      {existingAttachments.length === 0 &&
        pendingAttachments.length === 0 &&
        !isAddingAttachment &&
        !isSubmitting && (
          <p className="p-16 bg-grayscale-100 rounded-4 text-grayscale-600 text-sm mb-16">
            No files attached yet.
          </p>
        )}

      {/* Existing Attachments */}
      <ExistingAttachments
        attachments={existingAttachments}
        onRemove={handleRemoveExistingAttachment}
      />

      {/* Pending Attachments */}
      <PendingAttachments
        pendingAttachments={pendingAttachments}
        onRemove={handleRemovePendingAttachment}
      />

      {/* Attachment Editor */}
      {isAddingAttachment && !isSubmitting && (
        <div className="mt-16">
          <AttachmentEditor
            documentTypes={documentTypes}
            onAddFile={handleAddFile}
            onAddUrl={handleAddUrl}
          />

          <div className="flex justify-end mt-16">
            <Button variant="secondary" onClick={handleCancelAdd} text="Cancel" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeAttachmentsForm;
