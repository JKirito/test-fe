import { ProcessedBenchmarkData } from './types/benchmark';

export interface IBenchmarkFilters {
  sector: string;
  subSector: string;
  location: string;
  earliestYear: string;
  sourceOfConstructionCost: string;
  classEstimate: string;
  sectorSpecificAnswers: Array<{ id: string; question: string; answer: string }>;
  subSectorSpecificAnswers: Array<{ id: string; question: string; answer: string }>;
}

export interface IBenchmarkProject {
  _id: string;
  project_code: string;
  'Project Code': string;
  'Project Name': string;
  'Brief Project Description': string;
  Sector: string;
  'Sub-Sector (Leave Blank if TBA)': string;
  'Construction Cost': number;
  'Source of Construction Cost': string;
  'Level of Estimate': string;
  'Year of Head Contract Execution (Leave Blank if not executed)': number;
  'Procurement Model': string;
  'Land Type': string;
  'Site area (m2)': number;
  'Fully Enclosed Covered Area (FECA)': number;
  'Unenclosed Covered Area (UCA)': number;
  uploadEstimate: {
    type: 'file' | 'url';
    value: string;
  };
  uploadOriginalEstimate: {
    type: 'file' | 'url';
    value: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IBenchmarkResponse {
  message: string;
  count: number;
  results: IBenchmarkProject[];
}

export interface IBenchmarkState {
  currentStep: 'filters' | 'results' | 'benchmark';
  filters: IBenchmarkFilters;
  isLoading: boolean;
  error: string | null;
  results: any[]; // Replace 'any' with your specific results type
  selectedProjects: IBenchmarkProject[];
  benchmarkData: ProcessedBenchmarkData[];
  expandedCodes: Set<string>;
  excludedRows: Set<string>;
  excludedProjects: Set<string>;
  excludedRates: Set<string>;
  maskProjectNames: boolean;
}

export type BenchmarkAction =
  | { type: 'SET_STEP'; payload: 'filters' | 'results' | 'benchmark' }
  | { type: 'SET_FILTER'; payload: { field: keyof IBenchmarkFilters; value: any } }
  | { type: 'SET_SECTOR_ANSWER'; payload: { index: number; answer: string } }
  | { type: 'SET_SUBSECTOR_ANSWER'; payload: { index: number; answer: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULTS'; payload: any[] }
  | { type: 'SET_SELECTED_PROJECTS'; payload: IBenchmarkProject[] }
  | {
    type: 'SET_BENCHMARK_DATA';
    payload: { data: ProcessedBenchmarkData[]; expandedCodes: string[] };
  }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_EXCLUDED_ROW'; payload: string }
  | { type: 'TOGGLE_EXCLUDED_PROJECT'; payload: string }
  | { type: 'TOGGLE_EXCLUDED_RATE'; payload: string }
  | { type: 'TOGGLE_MASK_PROJECT_NAMES' };
