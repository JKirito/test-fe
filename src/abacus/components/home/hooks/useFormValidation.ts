import { useHomeData } from '../HomeContext';
import { IFirstStepData, ISecondStepData } from '../types';

export const useFormValidation = () => {
  const { state, dispatch } = useHomeData();

  const validateFirstStep = (data: Partial<IFirstStepData>): string[] => {
    const errors: string[] = [];

    if (!data.projectId?.trim()) errors.push('Project ID is required');
    if (!data.projectName?.trim()) errors.push('Project Name is required');
    if (!data.sector?.trim()) errors.push('Sector is required');
    if (!data.subSector?.trim()) errors.push('Sub Sector is required');
    if (!data.sourceOfConstructionCost?.trim())
      errors.push('Source of Construction Cost is required');
    if (!data.levelOfEstimate?.trim()) errors.push('Level of Estimate is required');

    return errors;
  };

  const validateSecondStep = (data: Partial<ISecondStepData>): string[] => {
    const errors: string[] = [];

    // if (!data.procurementModel?.trim()) errors.push('Procurement Model is required');

    // Remove validation for sector and sub-sector specific questions
    // const hasUnansweredSectorQuestions = data.sectorSpecificQuestions?.some(q => !q.answer.trim());
    // if (hasUnansweredSectorQuestions) errors.push('All Sector Specific Questions must be answered');

    // const hasUnansweredSubSectorQuestions = data.subSectorSpecificQuestions?.some(q => !q.answer.trim());
    // if (hasUnansweredSubSectorQuestions) errors.push('All Sub Sector Specific Questions must be answered');

    // Validate only the required estimate file
    if (!data.uploadEstimate) errors.push('Estimate file is required');

    return errors;
  };

  const validateCurrentStep = (): string[] => {
    const { currentStep, data } = state;

    if (currentStep === 'first') {
      return validateFirstStep(data);
    } else if (currentStep === 'second') {
      return validateSecondStep(data);
    }

    return [];
  };

  const handleValidationErrors = (errors: string[]) => {
    if (errors.length > 0) {
      dispatch({ type: 'SET_ERROR', payload: errors.join(', ') });
      return false;
    }
    dispatch({ type: 'CLEAR_ERROR' });
    return true;
  };

  return {
    validateCurrentStep,
    handleValidationErrors,
    error: state.error,
  };
};
