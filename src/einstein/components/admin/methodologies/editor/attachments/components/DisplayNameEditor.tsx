import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface DisplayNameEditorProps {
  initialName: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

const DisplayNameEditor: React.FC<DisplayNameEditorProps> = ({
  initialName,
  onSave,
  onCancel,
  autoFocus = true,
}) => {
  const [displayName, setDisplayName] = useState(initialName);

  useEffect(() => {
    setDisplayName(initialName);
  }, [initialName]);

  const handleSubmit = () => {
    if (displayName.trim()) {
      onSave(displayName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-8 w-full">
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-8 py-6 border border-primary-300 rounded-4 text-sm outline-none focus:ring-2 focus:ring-primary-300"
        placeholder="Enter display name"
        autoFocus={autoFocus}
      />
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-primary-50 border border-primary-200 text-primary-600 p-4 rounded-4 flex items-center justify-center transition-all hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!displayName.trim()}
          aria-label="Save"
        >
          <Save size={16} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-grayscale-100 border border-grayscale-200 text-grayscale-600 p-4 rounded-4 flex items-center justify-center transition-all hover:bg-grayscale-200 hover:text-grayscale-700"
          aria-label="Cancel"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default DisplayNameEditor;
