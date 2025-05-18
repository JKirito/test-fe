import React from 'react';
import { HowTo, AttachedFile } from '../types/howTo.types';
import InfoSection from './InfoSection';
import AttachedFilesList from './AttachedFilesList';
// Other imports commented out as not needed
import EditorHeader from './EditorHeader';

interface EditorContentProps {
  selectedHowTo: HowTo;
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  editedData: Partial<HowTo> | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDataChange: (data: Partial<HowTo>) => void;
}

/**
 * EditorContent component for displaying the content of a selected How-To item
 */
const EditorContent: React.FC<EditorContentProps> = ({
  selectedHowTo,
  isEditing,
  isSaving,
  saveError,
  editedData,
  onEdit,
  onCancel,
  onSave,
  onDataChange,
}) => {
  return (
    <div className="p-4 max-w-full mx-auto editor-section">
      <EditorHeader
        isEditing={isEditing}
        isSaving={isSaving}
        saveError={saveError}
        selectedHowTo={selectedHowTo}
        editedData={editedData}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        onTitleChange={(title) => onDataChange({ ...editedData, title })}
        onOrderChange={(order) => onDataChange({ ...editedData, order })}
      />

      {/* Overview Section */}
      <InfoSection
        title="Content"
        content={isEditing ? editedData?.overview : selectedHowTo?.overview}
        isEditing={isEditing}
        onContentChange={(content) =>
          onDataChange({
            ...editedData,
            overview: content,
            description: content.replace(/<[^>]*>/g, ''),
          })
        }
      />

      {/*
      // Key Information Section - Commented out as requested
      <InfoSection
        title="Key Information"
        content={isEditing ? editedData?.keyInformation : selectedHowTo?.keyInformation}
        isEditing={isEditing}
        onContentChange={(content) => onDataChange({ ...editedData, keyInformation: content })}
      />

      // Best Practices Section - Commented out as requested
      <InfoSection
        title="Best Practices"
        content={isEditing ? editedData?.bestPractices : selectedHowTo?.bestPractices}
        isEditing={isEditing}
        onContentChange={(content) => onDataChange({ ...editedData, bestPractices: content })}
      />

      // Rule of Thumb Section - Commented out as requested
      <InfoSection
        title="Rule of Thumb"
        content={isEditing ? editedData?.ruleOfThumb : selectedHowTo?.ruleOfThumb}
        isEditing={isEditing}
        onContentChange={(content) => onDataChange({ ...editedData, ruleOfThumb: content })}
      />
      */}

      {/* Attached Files Section - Added back as requested */}
      <AttachedFilesList
        files={
          isEditing
            ? (editedData?.attachedFiles as AttachedFile[]) || []
            : selectedHowTo?.attachedFiles || []
        }
        isEditing={isEditing}
        onFilesChange={(files) => onDataChange({ ...editedData, attachedFiles: files })}
      />
    </div>
  );
};

export default EditorContent;
