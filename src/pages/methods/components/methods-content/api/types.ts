// API response types

export interface ApiMethodologyItem {
  _id: string;
  name: string;
  description?: string;
  nodeType: string;
  order?: number;
  nextLevelName?: string;
  parentId: string | null;
  files?: ApiFile[];
  experts?: ApiExpert[];
  createdAt: string;
}

export interface ApiFile {
  fileId: string;
  originalFileName: string;
  docType: string;
  url?: string;
  _id: string;
}

export interface ApiExpert {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse {
  data: ApiMethodologyItem[];
}

// Level selection tracking
export interface LevelSelection {
  nodeId: string;
  nodeType: string;
  nextLevelName?: string;
  data: any; // IMethodCard - defined in the methods.models
  path: number[];
  files: ApiFile[];
  experts: ApiExpert[];
}
