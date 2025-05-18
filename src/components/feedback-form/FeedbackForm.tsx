import { useState } from 'react';
import { FeedbackModal } from './FeedbackModal';
import styles from './FeedbackForm.module.scss';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/config/axiosConfig';
export const FeedbackForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    // // console.log('Feedback submitted:', feedback); // Replace with your actual submission logic (e.g., API call)
    // Optionally add a success notification here
    try {
      await apiClient.post('/feedback', {
        message: feedback,
      });
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again later.');
    }

    handleCloseModal(); // Close modal after submission
  };

  return (
    <>
      {/* Trigger Button */}
      <button onClick={handleOpenModal} className={styles.feedbackTriggerButton}>
        <img src="/icons/star-outlined.svg" alt="Feedback" />
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};
