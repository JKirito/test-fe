import { createContext, useContext, useReducer, ReactNode } from 'react';
import { IFormState, FormAction, FormStep, IFormData } from './types';

const initialFormData: IFormData = {
  projectId: '',
  projectName: '',
  projectDescription: '',
  sector: '',
  subSector: '',
  sourceOfConstructionCost: '',
  levelOfEstimate: '',
  procurementModel: '',
  yearOfHeadContractNUM: '',
  landType: '',
  siteArea: '',
  fullyEnclosedCoveredArea: '',
  unenclosedCoveredArea: '',
  sectorSpecificQuestions: [],
  subSectorSpecificQuestions: [],
  attachments: [],
};

const initialState: IFormState = {
  currentStep: 'first',
  isSubmitting: false,
  error: null,
  data: initialFormData,
};

function formReducer(state: IFormState, action: FormAction): IFormState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FIRST_STEP':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };
    case 'UPDATE_SECOND_STEP':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

interface HomeContextType {
  state: IFormState;
  dispatch: React.Dispatch<FormAction>;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  return <HomeContext.Provider value={{ state, dispatch }}>{children}</HomeContext.Provider>;
};

export const useHomeData = () => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};

// Custom hooks for specific form operations
export const useFormNavigation = () => {
  const { state, dispatch } = useHomeData();

  const goToStep = (step: FormStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const goToNextStep = () => {
    if (state.currentStep === 'first') goToStep('second');
    // We don't have a 'review' step in the current implementation
    // else if (state.currentStep === 'second') goToStep('review');
  };

  const goToPreviousStep = () => {
    if (state.currentStep === 'second') goToStep('first');
    // We don't have a 'review' step in the current implementation
    // else if (state.currentStep === 'review') goToStep('second');
  };

  return {
    currentStep: state.currentStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep: state.currentStep === 'first',
    isLastStep: state.currentStep === 'second',
  };
};
