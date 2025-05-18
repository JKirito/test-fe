/**
 * Project interface representing project data
 * @interface Project
 * @property {string} [_id] - Optional unique identifier for the project
 * @property {string} [projectid] - Optional project ID
 * @property {string} [project_code] - Optional project code
 */
export interface Project {
  _id?: string;
  projectid?: string;
  project_code?: string;
  [key: string]: any;
}

// Define the structure of the table data
export interface TableData {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define the view types
export type ViewType = 'table' | 'chart';
