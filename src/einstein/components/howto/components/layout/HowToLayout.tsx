import React from 'react';
import styles from './HowToLayout.module.scss';
import animationStyles from '@/styles/theme/animations.module.scss';

interface HowToLayoutProps {
  filtersSlot: React.ReactNode;
  quickLinksSlot?: React.ReactNode; // Optional for conditional rendering
  contentSlot: React.ReactNode;
}

/**
 * Basic two-column layout for the HowTo page.
 */
const HowToLayout: React.FC<HowToLayoutProps> = ({ filtersSlot, quickLinksSlot, contentSlot }) => {
  return (
    <div className={styles.howtoLayout}>
      <div className={styles.sidebar}>
        {filtersSlot}
        {quickLinksSlot}
      </div>
      <div className={`${styles.content} ${animationStyles.fade}`}>{contentSlot}</div>
    </div>
  );
};

export default HowToLayout;
