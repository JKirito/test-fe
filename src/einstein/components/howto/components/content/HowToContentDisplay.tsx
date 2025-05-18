import React from 'react';
import { HowToWithChildren } from '@/einstein/components/admin/howTo/types/howTo.types.ts';
import { Spinner } from '@/einstein/components/common/Spinner';
import HowToContent from '../HowToContent';
import styles from './HowToContentDisplay.module.scss';

interface HowToContentDisplayProps {
  isLoading: boolean;
  hasAppliedFilters: boolean;
  hasPartialFilters: boolean;
  missingFilters: string[];
  howTosCount: number; // Pass count instead of full array
  selectedHowTo: HowToWithChildren | null;
}

/**
 * Handles rendering the main content area based on loading and filter states.
 */
const HowToContentDisplay: React.FC<HowToContentDisplayProps> = ({
  isLoading,
  hasAppliedFilters,
  hasPartialFilters,
  missingFilters,
  howTosCount,
  selectedHowTo,
}) => {
  // Loading state for filters/initial data (before filters applied)
  if (isLoading && !hasAppliedFilters) {
    return (
      <div className={`${styles.howtoContentDisplay} ${styles.message}`}>
        <span className={styles.messageText}>Loading filter options...</span>
      </div>
    );
  }

  // Loading state AFTER filters applied (fetching specific content)
  if (isLoading && hasAppliedFilters) {
    return (
      <div className={`${styles.howtoContentDisplay} ${styles.loading}`}>
        <Spinner className={styles.spinner} />
        <span className={styles.messageText}>Loading how-to content...</span>
      </div>
    );
  }

  // Prompt to select all filters
  if (!hasAppliedFilters) {
    return (
      <div className={`${styles.howtoContentDisplay} ${styles.prompt}`}>
        <div className={styles.promptContent}>
          <h3 className={styles.promptTitle}>Select Filters To View Content</h3>
        </div>
      </div>
    );
  }

  // No data found AFTER filters applied
  if (howTosCount === 0) {
    return (
      <div className={`${styles.howtoContentDisplay} ${styles.noContent}`}>
        <div className={styles.noContentInner}>
          <h3 className={styles.noContentTitle}>No Content Found</h3>
          <p className={styles.noContentText}>
            No content is available for the selected filters. Please try different filter options.
          </p>
        </div>
      </div>
    );
  }

  // Render the actual content
  return (
    <div className={styles.howtoContentDisplay}>
      {/* Consider if HowToHeaderLinks should be here or inside HowToContent */}
      {selectedHowTo ? (
        <>
          <HowToContent howTo={selectedHowTo} />
          {/* <HowToHeaderLinks /> */}
        </>
      ) : (
        // Fallback if default selection hasn't happened yet (should be rare)
        <div className={styles.placeholder}>Please select an item from the Quick Links.</div>
      )}
    </div>
  );
};

export default HowToContentDisplay;
