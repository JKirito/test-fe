import { ProcessedBenchmarkData } from '../../../types/benchmark';
import { IBenchmarkProject } from '../../../types';

// Extend the ColumnMeta type for TanStack Table
declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends unknown, TValue> {
    frozen?: 'left' | 'right';
    isAverage?: boolean;
  }
}

// Column width constants
export const COLUMN_WIDTHS = {
  code: 150,
  description: 250,
  projectColumn: 200, // Increased from 150 to 420
  averageTotal: 150,
  averageRate: 150,
};

// Props for the table component
export interface BenchmarkTableProps {
  data: ProcessedBenchmarkData[];
  selectedProjects: IBenchmarkProject[];
  onDataChange?: (updatedData: ProcessedBenchmarkData[]) => void;
}

// Types for cell styling
export interface CellPosition {
  stickyClass: string;
  leftPosition: string;
  rightPosition: string;
  borderClass: string;
  bgColor?: string;
}
