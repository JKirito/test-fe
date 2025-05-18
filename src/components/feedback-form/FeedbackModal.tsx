import React, { useState } from 'react';
import styles from './FeedbackModal.module.scss';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

export const FeedbackModal = ({ isOpen, onClose, onSubmit }: FeedbackModalProps) => {
  const [feedbackText, setFeedbackText] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      onSubmit(feedbackText);
      setFeedbackText(''); // Clear textarea after submit
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Feedback Form</h2>
        <p className={styles.modalSubtitle}>
          We value your feedback. Please share your thoughts with us so we can improve our service.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Your feedback helps us improve..."
            rows={5}
            required
          />
          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
