// src/abacus/components/home/review/ReviewStepActions.tsx
import React from 'react';
import './ReviewStepActions.scss'; // Import SCSS

interface ReviewStepActionsProps {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ReviewStepActions: React.FC<ReviewStepActionsProps> = ({
  onBack,
  onSubmit,
  isSubmitting,
}) => (
  <div className="reviewActions">
    <button onClick={onBack} className="reviewActions__button reviewActions__button--back">
      Back
    </button>
    <button
      onClick={onSubmit}
      disabled={isSubmitting}
      className="reviewActions__button reviewActions__button--submit"
    >
      {isSubmitting ? 'Submitting...' : 'Submit for Review'}
    </button>
  </div>
);

export default ReviewStepActions;
