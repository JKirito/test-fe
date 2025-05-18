import React from 'react';
import { Edit2 } from 'lucide-react';
import { HowTo } from '../types/howTo.types';
import '@/einstein/components/common/tiptapEditor/TipTapContent.module.scss';

interface EditorHeaderProps {
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  selectedHowTo?: HowTo | null;
  editedData: Partial<HowTo> | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onOrderChange: (order: string) => void;
}

/**
 * EditorHeader component for displaying the title, description, and edit controls
 */
const EditorHeader: React.FC<EditorHeaderProps> = ({
  isEditing,
  isSaving,
  saveError,
  selectedHowTo,
  editedData,
  onEdit,
  onCancel,
  onSave,
  onTitleChange,
  onOrderChange,
}) => {
  return (
    <div className="px-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              className="w-full text-lg font-medium text-titlePrimaryBlue mb-2 p-2 border border-gray-300 rounded-md"
              value={editedData?.title || ''}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Title"
            />
          ) : (
            <h1 className="text-xl font-medium text-titlePrimaryBlue mb-2">
              {selectedHowTo?.title}
            </h1>
          )}

          {/* Description field removed - replaced with Overview InfoSection */}

          {isEditing && (
            <div className="mt-2">
              <label className="block text-titlePrimaryBlue font-medium mb-1 text-sm">Order</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md text-md"
                value={editedData?.order || ''}
                onChange={(e) => onOrderChange(e.target.value)}
                placeholder="Enter order (e.g., 1, 2a, 3)"
              />
            </div>
          )}
        </div>

        <div className="ml-4 flex gap-2">
          {isEditing ? (
            <>
              <button onClick={onCancel} className="e-btn-reset e-btn-md" disabled={isSaving}>
                <span>Cancel</span>
              </button>
              <button onClick={onSave} className="e-btn-apply e-btn-md" disabled={isSaving}>
                <span>
                  {isSaving
                    ? selectedHowTo
                      ? 'Updating...'
                      : 'Creating...'
                    : selectedHowTo
                      ? 'Update'
                      : 'Create'}
                </span>
              </button>
            </>
          ) : (
            <button onClick={onEdit} className="e-btn-outline e-btn-with-icon e-btn-md">
              <Edit2 className="e-btn-icon" />
              <span>Edit Content</span>
            </button>
          )}
        </div>
      </div>

      {saveError && (
        <div className="bg-red-50 text-red-700 p-2 rounded-md mb-3 text-sm">{saveError}</div>
      )}
    </div>
  );
};

export default EditorHeader;
