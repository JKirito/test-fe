import { createContext, useContext, useReducer } from 'react';
import { IBenchmarkState, BenchmarkAction, IBenchmarkFilters } from './types';

const initialFilters: IBenchmarkFilters = {
  sector: '',
  subSector: '',
  location: '',
  earliestYear: '',
  sourceOfConstructionCost: '',
  classEstimate: '',
  sectorSpecificAnswers: [],
  subSectorSpecificAnswers: [],
};

const initialState: IBenchmarkState = {
  filters: initialFilters,
  benchmarkData: [],
  expandedCodes: new Set(),
  excludedRows: new Set(),
  excludedProjects: new Set(),
  excludedRates: new Set(),
  results: [],
  isLoading: false,
  error: null,
  currentStep: 'filters',
  selectedProjects: [],
  maskProjectNames: true, // Default to hiding client names
};

function benchmarkReducer(state: IBenchmarkState, action: BenchmarkAction): IBenchmarkState {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.field]: action.payload.value,
        },
      };
    case 'SET_SECTOR_ANSWER':
      return {
        ...state,
        filters: {
          ...state.filters,
          sectorSpecificAnswers: state.filters.sectorSpecificAnswers.map((q, i) =>
            i === action.payload.index ? { ...q, answer: action.payload.answer } : q
          ),
        },
      };
    case 'SET_SUBSECTOR_ANSWER':
      return {
        ...state,
        filters: {
          ...state.filters,
          subSectorSpecificAnswers: state.filters.subSectorSpecificAnswers.map((q, i) =>
            i === action.payload.index ? { ...q, answer: action.payload.answer } : q
          ),
        },
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET_FILTERS':
      return { ...state, filters: initialFilters };
    case 'SET_BENCHMARK_DATA':
      const newState = {
        ...state,
        benchmarkData: action.payload.data,
        expandedCodes: new Set(action.payload.expandedCodes),
      };
      return newState;
    case 'SET_SELECTED_PROJECTS':
      return {
        ...state,
        selectedProjects: action.payload,
      };
    case 'TOGGLE_EXCLUDED_ROW': {
      const newExcludedRows = new Set(state.excludedRows);
      if (newExcludedRows.has(action.payload)) {
        newExcludedRows.delete(action.payload);
      } else {
        newExcludedRows.add(action.payload);
      }
      return {
        ...state,
        excludedRows: newExcludedRows,
      };
    }
    case 'TOGGLE_EXCLUDED_PROJECT': {
      const newExcludedProjects = new Set(state.excludedProjects);
      if (newExcludedProjects.has(action.payload)) {
        newExcludedProjects.delete(action.payload);
      } else {
        newExcludedProjects.add(action.payload);
      }
      return {
        ...state,
        excludedProjects: newExcludedProjects,
      };
    }
    case 'TOGGLE_EXCLUDED_RATE': {
      const newExcludedRates = new Set(state.excludedRates);
      if (newExcludedRates.has(action.payload)) {
        newExcludedRates.delete(action.payload);
      } else {
        newExcludedRates.add(action.payload);
      }
      return {
        ...state,
        excludedRates: newExcludedRates,
      };
    }
    case 'TOGGLE_MASK_PROJECT_NAMES': {
      return {
        ...state,
        maskProjectNames: !state.maskProjectNames,
      };
    }
    default:
      return state;
  }
}

const BenchmarkContext = createContext<{
  state: IBenchmarkState;
  dispatch: React.Dispatch<BenchmarkAction>;
} | null>(null);

export const BenchmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(benchmarkReducer, {
    ...initialState,
    excludedRows: new Set<string>(),
  });

  return (
    <BenchmarkContext.Provider value={{ state, dispatch }}>{children}</BenchmarkContext.Provider>
  );
};

export const useBenchmark = () => {
  const context = useContext(BenchmarkContext);
  if (!context) {
    throw new Error('useBenchmark must be used within a BenchmarkProvider');
  }
  return context;
};
