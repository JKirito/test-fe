import React from 'react';
import styles from './ContentSection.module.scss';
import tiptapContentStyles from '@/einstein/components/common/tiptapEditor/TipTapContent.module.scss';

interface ContentSectionProps {
  title?: string;
  description: string;
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
 * Renders a simple content section with a title and HTML description.
 */
const ContentSection: React.FC<ContentSectionProps> = ({ title, description }) => {
  // Return null if description is empty or only contains empty HTML tags
  if (!hasContentData(description)) {
    return null;
  }

  return (
    <div className={styles.contentSection}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {/* Use dangerouslySetInnerHTML for HTML content */}
      <div
        className={`${styles.description} ${tiptapContentStyles['tiptap-content']}`}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};

export default ContentSection;
