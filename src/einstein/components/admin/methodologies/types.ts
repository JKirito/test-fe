interface FileMetaData {
  fileId: string;
  originalFileName: string;
  docType: 'framework' | 'template' | 'example';
  url: string;
  _id: string;
}

interface IExpert {
  name: string;
  email: string;
  title: string;
}

interface MethodologyNode {
  _id: string;
  name: string;
  nodeType: 'regular' | 'step';
  parentId: string | null;
  files: FileMetaData[];
  order?: number;
  nextLevelName?: string;
  experts?: IExpert[];
  description?: string;
  __v: number;
}

interface ApiResponse {
  data: MethodologyNode[];
  // ... other response fields
}

interface SaveData {
  stepIds: string[];
  nodeIds: string[];
  docType: 'framework' | 'template' | 'example';
  file: { name: string; size: number } | null;
}

export type { MethodologyNode, ApiResponse, FileMetaData, SaveData, IExpert };
