import React from 'react';
import InfoSection from './InfoSection';
import AttachedFilesList from './AttachedFilesList';
import { HowTo } from '../types/howTo.types';

interface NewHowToFormProps {
  editedData: Partial<HowTo>;
  isSaving: boolean;
  saveError: string | null;
  isTopLevel: boolean; // Kept for future use
  onCancel: () => void;
  onSave: () => void;
  onDataChange: (data: Partial<HowTo>) => void;
}

/**
 * NewHowToForm component for creating new How-To items
 */
const NewHowToForm: React.FC<NewHowToFormProps> = ({
  editedData,
  isSaving,
  saveError,
  isTopLevel,
  onCancel,
  onSave,
  onDataChange,
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-titlePrimaryBlue">Create A How To Section</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="e-btn-reset e-btn-md" disabled={isSaving}>
            Cancel
          </button>
          <button onClick={onSave} className="e-btn-apply e-btn-md" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {saveError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{saveError}</div>}

      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-titlePrimaryBlue font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            value={editedData.title || ''}
            onChange={(e) => onDataChange({ ...editedData, title: e.target.value })}
            placeholder="Enter title..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-titlePrimaryBlue font-medium mb-1">Order</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            value={editedData.order || ''}
            onChange={(e) => onDataChange({ ...editedData, order: e.target.value })}
            placeholder="Enter order (e.g., 1, 2a, 3)"
          />
        </div>

        <InfoSection
          title="Content"
          content={editedData.overview}
          isEditing={true}
          onContentChange={(content) =>
            onDataChange({
              ...editedData,
              overview: content,
              description: content.replace(/<[^>]*>/g, ''), // Keep plain text description for backward compatibility
            })
          }
        />

        {/*
        // Rule of Thumbs Section - Commented out as requested
        <InfoSection
          title="Rule of Thumbs"
          content={editedData.ruleOfThumb}
          isEditing={true}
          onContentChange={(content) => onDataChange({ ...editedData, ruleOfThumb: content })}
        />

        // Key Information Section - Commented out as requested
        <InfoSection
          title="Key Information"
          content={editedData.keyInformation}
          isEditing={true}
          onContentChange={(content) => onDataChange({ ...editedData, keyInformation: content })}
        />

        // Best Practices Section - Commented out as requested
        <InfoSection
          title="Best Practices"
          content={editedData.bestPractices}
          isEditing={true}
          onContentChange={(content) => onDataChange({ ...editedData, bestPractices: content })}
        />
        */}

        {/* Attached Files Section - Added back as requested */}
        <AttachedFilesList
          files={editedData.attachedFiles || []}
          isEditing={true}
          onFilesChange={(files) => onDataChange({ ...editedData, attachedFiles: files })}
        />
      </div>
    </div>
  );
};

export default NewHowToForm;
