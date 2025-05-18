import React from 'react';
import { HowTo, AttachedFile } from '../types/howTo.types';
import { Edit, FileText } from 'lucide-react';
import styles from '@/einstein/components/common/tiptapEditor/TipTapContent.module.scss';
import { useAttachedFiles } from '../editor/hooks/useAttachedFiles';
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

interface HowToContentProps {
  selectedHowTo: HowTo;
  onEdit: () => void;
}

/**
 * HowToContent component for displaying the content of a selected How-To item
 */
const HowToContent: React.FC<HowToContentProps> = ({ selectedHowTo, onEdit }) => {
  const { handleFileClick } = useAttachedFiles(selectedHowTo.attachedFiles, onEdit);
  // Check if there's any meaningful content in any section
  const hasAnyContent =
    hasContentData(selectedHowTo.overview) ||
    hasContentData(selectedHowTo.keyInformation) ||
    hasContentData(selectedHowTo.bestPractices) ||
    hasContentData(selectedHowTo.ruleOfThumb) ||
    (selectedHowTo.attachedFiles && selectedHowTo.attachedFiles.length > 0);

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-titlePrimaryBlue mb-2">
            {selectedHowTo.title}
          </h1>
        </div>
        <button
          onClick={onEdit}
          className="e-btn-apply e-btn-with-icon max-w-[100px]"
          aria-label="Edit"
        >
          <Edit size={18} className="e-btn-icon" />
          <span>Edit</span>
        </button>
      </div>

      {/* No Content Message */}
      {!hasAnyContent && (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">This section doesn't have any content yet.</p>
          <p className="text-gray-500">Click the Edit button to add content.</p>
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Overview Section */}
        {hasContentData(selectedHowTo.overview) && (
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-titlePrimaryBlue mb-3">Content</h2>
            <div
              className={`prose max-w-none ${styles['tiptap-content']}`}
              dangerouslySetInnerHTML={{ __html: selectedHowTo.overview || '' }}
            />
          </section>
        )}
        {/* Key Information Section */}
        {hasContentData(selectedHowTo.keyInformation) && (
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-titlePrimaryBlue mb-3">Key Information</h2>
            <div
              className={`prose max-w-none ${styles['tiptap-content']}`}
              dangerouslySetInnerHTML={{ __html: selectedHowTo.keyInformation || '' }}
            />
          </section>
        )}

        {/* Best Practices Section */}
        {hasContentData(selectedHowTo.bestPractices) && (
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-titlePrimaryBlue mb-3">Best Practices</h2>
            <div
              className={`prose max-w-none ${styles['tiptap-content']}`}
              dangerouslySetInnerHTML={{ __html: selectedHowTo.bestPractices || '' }}
            />
          </section>
        )}

        {/* Rule of Thumb Section */}
        {hasContentData(selectedHowTo.ruleOfThumb) && (
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-titlePrimaryBlue mb-3">Rule of Thumb</h2>
            <div
              className={`prose max-w-none ${styles['tiptap-content']}`}
              dangerouslySetInnerHTML={{ __html: selectedHowTo.ruleOfThumb || '' }}
            />
          </section>
        )}

        {/* Attached Files Section */}
        {selectedHowTo.attachedFiles && selectedHowTo.attachedFiles.length > 0 && (
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-titlePrimaryBlue mb-3">Attached Files</h2>
            <ul className="space-y-2">
              {selectedHowTo.attachedFiles.map((file: AttachedFile, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                    onClick={(e) => handleFileClick(e, file.url)}
                  >
                    <FileText className="h-24 w-24 flex-shrink-0 text-titlePrimaryBlue" />
                    <span className="truncate">{file.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default HowToContent;
