export interface IBenchmarkProject {
  _id: string;
  project_code: string;
  'Project Code': string;
  'Project Name': string;
  'Brief Project Description': string;
  Sector: string;
  'Sub-Sector': string;
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
