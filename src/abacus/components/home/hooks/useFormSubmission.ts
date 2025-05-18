import { useHomeData } from '../HomeContext';
import { useFormValidation } from './useFormValidation';
import { useFormNavigation } from '../HomeContext';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import { toast } from 'react-hot-toast';

// Helper function to check if value is a File
const isFile = (value: any): value is File => {
  return value instanceof File;
};

interface FormSubmissionOptions {
  onSubmitSuccess?: () => void;
}

export const useFormSubmission = (options?: FormSubmissionOptions) => {
  const { state, dispatch } = useHomeData();
  const { validateCurrentStep, handleValidationErrors } = useFormValidation();
  const { goToNextStep, isLastStep } = useFormNavigation();
  const { onSubmitSuccess } = options || {};

  const handleStepSubmit = async () => {
    dispatch({ type: 'CLEAR_ERROR' });

    const errors = validateCurrentStep();
    if (!handleValidationErrors(errors)) {
      return;
    }

    // console.log('Current step:', state.currentStep);
    // console.log('Is last step?', isLastStep);

    if (isLastStep) {
      // console.log('Executing final submit...');
      await handleFinalSubmit();
    } else {
      // console.log('Going to next step...');
      goToNextStep();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      toast.loading('Submitting project...', { id: 'submit' });

      const formData = new FormData();

      // Create a metadata object for the form fields
      const formMetadata = {
        projectId: state.data.projectId,
        projectName: state.data.projectName,
        projectDescription: state.data.projectDescription,
        sector: state.data.sector,
        subSector: state.data.subSector,
        sourceOfConstructionCost: state.data.sourceOfConstructionCost,
        levelOfEstimate: state.data.levelOfEstimate,
        procurementModel: state.data.procurementModel,
        yearOfHeadContractNUM: state.data.yearOfHeadContractNUM,
        landType: state.data.landType,
        siteArea: state.data.siteArea,
        fullyEnclosedCoveredArea: state.data.fullyEnclosedCoveredArea,
        unenclosedCoveredArea: state.data.unenclosedCoveredArea,
        sectorSpecificQuestions: state.data.sectorSpecificQuestions,
        subSectorSpecificQuestions: state.data.subSectorSpecificQuestions,
      };

      // Append the form metadata as a JSON string
      formData.append('formData', JSON.stringify(formMetadata));

      // Handle uploadEstimate
      if (state.data.uploadEstimate) {
        const file = state.data.uploadEstimate.value;
        // Append the actual file if it's a File object
        if (isFile(file)) {
          formData.append('uploadEstimate', file);
          // Append metadata about the file
          formData.append(
            'uploadEstimateMetadata',
            JSON.stringify({
              type: 'file',
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            })
          );
        } else if (typeof file === 'string') {
          // Handle URL case
          formData.append(
            'uploadEstimateMetadata',
            JSON.stringify({
              type: 'url',
              value: file,
            })
          );
        }
      }

      // Handle attachments
      if (state.data.attachments && state.data.attachments.length > 0) {
        state.data.attachments.forEach((attachment, index) => {
          const file = attachment.value;
          // Only append if it's a File object
          if (isFile(file)) {
            // Append the actual file with an index
            formData.append(`attachment_${index}`, file);
            // Append metadata about the file
            formData.append(
              `attachmentMetadata_${index}`,
              JSON.stringify({
                type: 'file',
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
              })
            );
          } else if (typeof file === 'string') {
            // Handle URL case
            formData.append(
              `attachmentMetadata_${index}`,
              JSON.stringify({
                type: 'url',
                value: file,
              })
            );
          }
        });

        // Add the count of attachments
        formData.append('attachmentCount', state.data.attachments.length.toString());
      }

      // console.log('Making API call to /projects/ with formData:', formData);
      // console.log('API URL:', abacusApiClient.defaults.baseURL);

      try {
        const response = await abacusApiClient.post('/projects/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // console.log('Submission successful:', response.data);
        dispatch({ type: 'RESET_FORM' });
        toast.success('Project submitted successfully!', { id: 'submit', duration: 4000 });

        // Call the onSubmitSuccess callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } catch (apiError) {
        console.error('API call error details:', apiError);
        throw apiError; // Re-throw to be caught by the outer catch block
      }
    } catch (error) {
      console.error('Submission error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An error occurred during submission',
      });
      toast.error(
        `Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: 'submit', duration: 4000 }
      );
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  return {
    handleStepSubmit,
    isSubmitting: state.isSubmitting,
  };
};
