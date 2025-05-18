import React from 'react';
import styles from './CuriosityDemoModal.module.scss';

interface CuriosityDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string; // Optional: specify which feature is coming soon
}

const CuriosityDemoModal: React.FC<CuriosityDemoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {' '}
        {/* Prevent closing when clicking inside content */}
        <h2 className={styles.modalTitle}>Coming Soon In Einstein V2.0</h2>
        <p className={styles.modalDescription}>
          Enrich your pitches and projects with smart insights and recommendations based on our rich
          project delivery history
        </p>
        <div className={styles.modalButtonContainer}>
          <button className={styles.closeButton} onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default CuriosityDemoModal;
