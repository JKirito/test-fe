export type FormStep = 'first' | 'second';

export interface IQuestion {
  question: string;
  answer?: string;
  options?: string[];
}

export interface IFirstStepData {
  projectId: string;
  projectName: string;
  projectDescription: string;
  sector: string;
  subSector: string;
  sourceOfConstructionCost: string;
  levelOfEstimate: string;
  procurementModel: string;
  yearOfHeadContractNUM: string;
  landType: string;
  siteArea: string;
  fullyEnclosedCoveredArea: string;
  unenclosedCoveredArea: string;
}

export interface UploadMetadata {
  type: 'file' | 'url';
  value: File | string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface ISecondStepData {
  sectorSpecificQuestions: IQuestion[];
  subSectorSpecificQuestions: IQuestion[];
  uploadEstimate?: UploadMetadata;
  attachments?: UploadMetadata[];
}

export type IFormData = IFirstStepData & ISecondStepData;

export interface IFormState {
  currentStep: FormStep;
  isSubmitting: boolean;
  error: string | null;
  data: IFormData;
}

export type FormAction =
  | { type: 'SET_STEP'; payload: FormStep }
  | { type: 'UPDATE_FIRST_STEP'; payload: Partial<IFirstStepData> }
  | { type: 'UPDATE_SECOND_STEP'; payload: Partial<ISecondStepData> }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET_FORM' };
