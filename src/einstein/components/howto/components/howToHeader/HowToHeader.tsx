import React from 'react';
import styles from './HowToHeader.module.scss';
import animationStyles from '@/styles/theme/animations.module.scss';
import { useAppSelector } from '@/lib/store/store';
/**
 * Header component for the How To page
 */
const HowToHeader: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const firstName = user?.name.split(' ')[0]; // Assuming user has a name property with a first name

  return (
    <div className={`${styles.howToHeader} ${animationStyles.fade}`}>
      <div className={styles.iconContainer}>
        <img src="/icons/how-to.svg" alt="How To Header" />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Let's Get Started, <span className={styles.firstName}>{firstName}</span>
        </h1>
        <p className={styles.description}>Select From The Options Below</p>
      </div>
    </div>
  );
};

export default HowToHeader;
