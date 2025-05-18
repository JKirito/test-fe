import React from 'react';
import { FileText } from 'lucide-react';
// import ExpandableModule from './ExpandableModule'; // Remove ExpandableModule
import ContentSection from './contentSection/ContentSection'; // Import the new component
// import ChildItemModule from './ChildItemModule'; // Remove unused import
// Update type imports if needed, assuming HowToItem might be slightly different now
import { HowToWithChildren } from '@/einstein/components/admin/howTo/types/howTo.types';
import { fetchSasUrl } from '@/lib/store/features/howto/howtoSlice';
import { useAppDispatch } from '@/lib/store/store';
import styles from './HowToContent.module.scss';

interface HowToContentProps {
  howTo: HowToWithChildren | null; // Use the correct, potentially richer type
}

/**
 * Component for displaying the main content sections of a selected HowTo item.
 * Does NOT render child items recursively.
 * Uses ContentSection for simple title/description display.
 */
const HowToContent: React.FC<HowToContentProps> = ({ howTo }) => {
  const dispatch = useAppDispatch();

  if (!howTo) return null;

  // Check if a URL is an Azure blob storage URL
  const isAzureBlobUrl = (url: string): boolean => {
    return url.includes('blob.core.windows.net');
  };

  // Handle file link click
  const handleFileClick = async (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    // console.log('handleFileClick', url);

    if (isAzureBlobUrl(url)) {
      try {
        // Dispatch the async thunk to get the SAS URL
        const resultAction = await dispatch(fetchSasUrl(url));

        if (fetchSasUrl.fulfilled.match(resultAction)) {
          // Open the SAS URL in a new tab
          window.open(resultAction.payload, '_blank');
        } else {
          console.error('Error getting SAS URL:', resultAction.payload);
          // Fallback to opening the original URL
          window.open(url, '_blank');
        }
      } catch (error) {
        console.error('Error getting SAS URL:', error);
        // Fallback to opening the original URL
        window.open(url, '_blank');
      }
    } else {
      // For non-Azure URLs, open directly
      window.open(url, '_blank');
    }
  };

  // Function to render attached files
  const renderAttachedFiles = () => {
    if (!howTo.attachedFiles || howTo.attachedFiles.length === 0) return null;

    return (
      <div className={styles.attachedFilesSection}>
        <h3 className={styles.title}>Attached Files</h3>
        <div className={styles.list}>
          {howTo.attachedFiles.map((file, index) => (
            <button
              key={index}
              onClick={(e) => handleFileClick(e, file.url)}
              className={styles.button}
            >
              <FileText className={styles.icon} />
              <span className={styles.label}>{file.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overview Section */}
      {(howTo.overview || howTo.description) && (
        <ContentSection description={howTo.overview || howTo.description} />
      )}

      {/* {howTo.keyInformation && (
        <ContentSection title="Key Information" description={howTo.keyInformation} />
      )}

      {howTo.ruleOfThumb && (
        <ContentSection title="Rule of Thumbs" description={howTo.ruleOfThumb} />
      )}

      {howTo.bestPractices && (
        <ContentSection title="Best Practices" description={howTo.bestPractices} />
      )} */}

      {renderAttachedFiles()}
    </>
  );
};

export default HowToContent;
