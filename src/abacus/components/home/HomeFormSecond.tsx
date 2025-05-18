import React, { useEffect, useState } from 'react';
import { useHomeData } from './HomeContext';
import { BaseFormStep } from './components/BaseFormStep';
import FileUpload from './components/fileUpload/FileUpload';
import SimpleFileUpload from './components/fileUpload/SingleFileUpload';
import { useQuestions } from './hooks/useQuestions';
import './HomeContent.scss';
import { useFormSubmission } from './hooks/useFormSubmission';

// Import standard components
import InputField from '@/einstein/components/common/inputField/InputField';
import { DownloadIcon } from 'lucide-react';
// Select and TextArea not needed for this form based on analysis

// Define fields/logic required for step 2
const checkQuestionsAnswered = (questions: { question: string; answer?: string }[]): boolean => {
  return questions.every((q) => q.answer && q.answer.trim() !== '');
};

// Use UploadMetadata from types.ts if possible, ensuring it matches
interface UploadMetadata {
  type: 'file' | 'url';
  value: File | string;
  fileName?: string; // Optional for URL type
  fileType?: string;
  fileSize?: number;
}

// Add onSubmitSuccess property to the component props
interface HomeFormSecondProps {
  onSubmitSuccess?: () => void;
}

export const HomeFormSecond: React.FC<HomeFormSecondProps> = ({ onSubmitSuccess }) => {
  const { state, dispatch } = useHomeData();
  const { data } = state;
  const { sectorQuestions, subSectorQuestions } = useQuestions();
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the handleStepSubmit from useFormSubmission, pass the onSubmitSuccess callback
  const { handleStepSubmit } = useFormSubmission({ onSubmitSuccess });

  useEffect(() => {
    if (!data.attachments) {
      dispatch({ type: 'UPDATE_SECOND_STEP', payload: { attachments: [] } });
    }
    if (data.sectorSpecificQuestions.length === 0 && sectorQuestions.length > 0) {
      dispatch({
        type: 'UPDATE_SECOND_STEP',
        payload: { sectorSpecificQuestions: sectorQuestions },
      });
    }
  }, [sectorQuestions, dispatch, data.attachments, data.sectorSpecificQuestions.length]);

  useEffect(() => {
    if (data.subSectorSpecificQuestions.length === 0 && subSectorQuestions.length > 0) {
      dispatch({
        type: 'UPDATE_SECOND_STEP',
        payload: { subSectorSpecificQuestions: subSectorQuestions },
      });
    }
  }, [subSectorQuestions, dispatch, data.subSectorSpecificQuestions.length]);

  const handleQuestionChange = (
    questionType: 'sector' | 'subSector',
    index: number,
    answer: string
  ) => {
    const questionsKey =
      questionType === 'sector' ? 'sectorSpecificQuestions' : 'subSectorSpecificQuestions';
    const errorKey = `${questionType}-question-${index}`;
    const questions = [...data[questionsKey]];
    questions[index] = { ...questions[index], answer };

    dispatch({
      type: 'UPDATE_SECOND_STEP',
      payload: { [questionsKey]: questions },
    });

    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: false }));
    }
  };

  // Synchronous Validation Function
  const validateFormSecondStep = (): boolean => {
    // Clear previous submission errors with empty string
    dispatch({ type: 'SET_ERROR', payload: '' });
    setErrors({});

    const newErrors: { [key: string]: boolean } = {};
    let isValid = true;

    data.sectorSpecificQuestions.forEach((q, index) => {
      if (!q.answer || q.answer.trim() === '') {
        newErrors[`sector-question-${index}`] = true;
        isValid = false;
      }
    });

    data.subSectorSpecificQuestions.forEach((q, index) => {
      if (!q.answer || q.answer.trim() === '') {
        newErrors[`subsector-question-${index}`] = true;
        isValid = false;
      }
    });

    if (!data.uploadEstimate) {
      newErrors['uploadEstimate'] = true;
      isValid = false;
    } else {
      newErrors['uploadEstimate'] = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Asynchronous Submission Function
  const triggerSubmit = async (): Promise<void> => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Clear previous errors with empty string
    dispatch({ type: 'SET_ERROR', payload: '' });

    try {
      // console.log('--- Submitting Form Data ---');
      // console.log(JSON.stringify(data, null, 2));

      // handleStepSubmit will handle the API call and form reset if successful
      await handleStepSubmit();

      // console.log('--- Submission Initiated ---');
    } catch (error) {
      console.error('--- Submission Failed ---', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred during submission.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEstimateSelect = (file: File | null) => {
    const errorKey = 'uploadEstimate';
    if (file) {
      const estimateData: UploadMetadata = {
        type: 'file',
        value: file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
      dispatch({
        type: 'UPDATE_SECOND_STEP',
        payload: { uploadEstimate: estimateData },
      });
      if (errors[errorKey]) {
        setErrors((prev) => ({ ...prev, [errorKey]: false }));
      }
    } else {
      dispatch({
        type: 'UPDATE_SECOND_STEP',
        payload: { uploadEstimate: undefined },
      });
    }
  };

  const handleAttachmentSelect = (index: number, selectedData: UploadMetadata | null) => {
    const attachments = [...(data.attachments || [])];

    if (selectedData) {
      if (index < attachments.length) {
        attachments[index] = selectedData;
      } else {
        attachments.push(selectedData);
      }
    } else {
      if (index < attachments.length) {
        attachments.splice(index, 1);
      }
    }
    dispatch({ type: 'UPDATE_SECOND_STEP', payload: { attachments } });
  };

  return (
    <BaseFormStep
      title="Project Details"
      onValidate={validateFormSecondStep}
      onSubmit={triggerSubmit}
      isSubmitting={isSubmitting}
    >
      {/* Section 1: Sector Questions */}
      <div className="homeFormSecond__section">
        <h3 className="homeFormSecond__sectionTitle">Sector Specific Questions</h3>
        {data.sectorSpecificQuestions.length > 0 ? (
          <div className="homeFormSecond__questionList">
            {data.sectorSpecificQuestions.map((question, index) => (
              <InputField
                key={`sector-${index}`}
                label={question.question}
                name={`sector-question-${index}`}
                value={question.answer || ''}
                onChange={(event) => handleQuestionChange('sector', index, event.target.value)}
                placeholder="Enter your answer"
                error={!!errors[`sector-question-${index}`]}
                labelClassName="homeForm__label"
              />
            ))}
          </div>
        ) : (
          <div className="homeFormSecond__noQuestions">No sector specific questions available.</div>
        )}
      </div>

      <div className="homeFormSecond__sectionSeparator"></div>

      {/* Section 2: Sub-Sector Questions */}
      <div className="homeFormSecond__section">
        <h3 className="homeFormSecond__sectionTitle">Sub-Sector Specific Questions</h3>
        {data.subSectorSpecificQuestions.length > 0 ? (
          <div className="homeFormSecond__questionList">
            {data.subSectorSpecificQuestions.map((question, index) => (
              <InputField
                key={`subsector-${index}`}
                label={question.question}
                name={`subsector-question-${index}`}
                value={question.answer || ''}
                onChange={(event) => handleQuestionChange('subSector', index, event.target.value)}
                placeholder="Enter your answer"
                error={!!errors[`subsector-question-${index}`]}
                labelClassName="homeForm__label"
              />
            ))}
          </div>
        ) : (
          <div className="homeFormSecond__noQuestions">
            No sub-sector specific questions available.
          </div>
        )}
      </div>

      <div className="homeFormSecond__sectionSeparator"></div>

      {/* Section 3: Files/Attachments */}
      <div className="homeFormSecond-files__section">
        <h3 className="homeFormSecond-files__sectionTitle">Files and attachments</h3>
        <div className="flex flex-col mb-6">
          <button type="button" className="homeFormSecond-files__button self-start mb-4" disabled>
            <DownloadIcon className="inline" height={24} width={24} />
            Download Template
          </button>

          <div className="mt-[16px]">
            <h3 className="homeFormSecond-files__sectionTitle">Upload Estimate</h3>
            <SimpleFileUpload
              onFileSelect={handleEstimateSelect}
              selectedFileInfo={
                data.uploadEstimate && data.uploadEstimate.fileName
                  ? { name: data.uploadEstimate.fileName }
                  : null
              }
              buttonText="Choose Estimate File"
            />
            {errors['uploadEstimate'] && !data.uploadEstimate && (
              <span className="text-sm text-red-500 mt-1 pl-2">Original Estimate is required</span>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="homeFormSecond-files__sectionTitle">Original Estimates</h3>
          </div>

          <div className="space-y-4">
            <div>
              <FileUpload
                onSelect={(selectedData) =>
                  handleAttachmentSelect(data.attachments?.length || 0, selectedData)
                }
                selectedData={null}
                buttonText="Upload Original Estimate / Enter URL"
              />
            </div>
            {(data.attachments || []).map((attachment, index) => (
              <div key={`attachment-${index}`}>
                <FileUpload
                  onSelect={(selectedData) => handleAttachmentSelect(index, selectedData)}
                  selectedData={attachment}
                  buttonText="Upload Original Estimate / Enter URL"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseFormStep>
  );
};
