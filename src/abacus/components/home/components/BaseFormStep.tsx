import React from 'react';
import { useHomeData, useFormNavigation } from '../HomeContext';
import styles from './BaseFormStep.module.scss';
import { useNavigate } from 'react-router-dom';

interface BaseFormStepProps {
  children: React.ReactNode;
  title: string;
  onValidate: () => boolean;
  isSubmitting?: boolean;
  onSubmit?: () => Promise<void>;
}

export const BaseFormStep: React.FC<BaseFormStepProps> = ({
  children,
  title,
  onValidate,
  isSubmitting = false,
  onSubmit,
}) => {
  const { state, dispatch } = useHomeData();
  const navigate = useNavigate();

  const { isFirstStep, isLastStep } = useFormNavigation();

  const handleNext = () => {
    if (onValidate()) {
      if (isLastStep) {
        if (onSubmit) {
          onSubmit().catch((err) => {
            console.error('Error triggering submission:', err);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to initiate submission.' });
          });
        } else {
          console.warn('onSubmit handler not provided for the final step.');
        }
      } else {
        dispatch({ type: 'SET_STEP', payload: 'second' });
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      dispatch({ type: 'SET_STEP', payload: 'first' });
    }
  };

  const handleExit = () => {
    navigate('/abacus-cost');
  };

  return (
    <div className={styles.baseFormStep}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.contentWrapper}>{children}</div>

      <div className={styles.actionsContainer}>
        <div className={styles.actionButtonsWrapper}>
          {!isFirstStep && (
            <button
              type="button"
              onClick={handleBack}
              className={styles.buttonPrevious}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}

          {isFirstStep && (
            <button
              type="button"
              onClick={handleExit}
              className={styles.buttonPrevious}
              disabled={isSubmitting}
            >
              Exit
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className={styles.buttonNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
