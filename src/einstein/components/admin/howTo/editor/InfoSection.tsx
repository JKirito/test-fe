import React from 'react';
import TipTapEditor from '@/einstein/components/common/tiptapEditor/TipTapEditor';
import '@/einstein/components/common/tiptapEditor/TipTapContent.module.scss';

interface InfoSectionProps {
  title: string;
  content?: string;
  isEditing: boolean;
  onContentChange: (content: string) => void;
}

/**
 * Helper function to check if HTML content is empty or just contains empty tags
 * @param html HTML content to check
 * @returns boolean indicating if the content has meaningful data
 */
const hasContentData = (html: string | undefined): boolean => {
  if (!html) return false;

  // Remove all HTML tags
  const textContent = html.replace(/<[^>]*>/g, '');

  // Check if there's any non-whitespace content
  const hasText = textContent.trim().length > 0;

  // Check for common empty editor patterns
  const isEmptyEditor =
    html === '<p></p>' ||
    html === '<p><br></p>' ||
    html === '<p>&nbsp;</p>' ||
    html === '<p> </p>' ||
    html.trim() === '' ||
    html.replace(/&nbsp;/g, ' ').trim() === '';

  return hasText && !isEmptyEditor;
};

/**
 * InfoSection component for displaying or editing a section of information
 * with a title and content area. Uses TipTap editor for rich text editing when in edit mode.
 */
const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  content,
  isEditing,
  onContentChange,
}) => {
  // Don't render anything if there's no meaningful content and we're not in edit mode
  if (!hasContentData(content) && !isEditing) return null;

  return (
    <div className={`rounded-lg px-4 mb-4`} style={{ fontFamily: "'Rubik', sans-serif" }}>
      <div className="flex items-center gap-2 mb-2">
        <h3
          className={`font-medium text-titlePrimaryBlue text-lg`}
          style={{ fontFamily: "'Rubik', sans-serif" }}
        >
          {title}
        </h3>
      </div>
      {isEditing ? (
        <div className="mb-4">
          <TipTapEditor
            value={content || ''}
            onChange={onContentChange}
            placeholder={`Enter ${title.toLowerCase()}...`}
            className="h-[100%]"
          />
        </div>
      ) : (
        <div
          className="text-lg tiptap-content"
          dangerouslySetInnerHTML={{ __html: content || '' }}
          style={{ fontFamily: "'Rubik', sans-serif" }}
        />
      )}
    </div>
  );
};

export default InfoSection;
