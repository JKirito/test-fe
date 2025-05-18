import apiClient from '@/lib/config/axiosConfig';
import { ApplyFiltersParams, FilterOptions, FilterResponse } from './filters';

// Define interfaces for chart data
export interface DeselectedRow {
  index: string;
  projectId: string;
}

export interface ChartDataParams {
  filters: any;
  deselectedRows: DeselectedRow[];
}

export interface BarChartData {
  stage: string;
  planned: number;
  actual: number;
  metric: string;
}

export interface ScatterChartData {
  gfa: number;
  planned: number;
  actual: number;
  projectId: string;
  metric: string;
}

export interface GanttChartData {
  name: string;
  phase: string;
  duration: number;
  startTime: Date;
  color: string;
  metric: string;
}

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

// Helper function to extract filename from Content-Disposition header
const getFilenameFromHeader = (header: string | null): string => {
  if (!header) return 'benchmark_data.xlsx'; // Default filename
  const contentDisposition = header.match(/filename\*?=UTF-8''(.+)|filename="(.+)"/i);
  if (contentDisposition && (contentDisposition[1] || contentDisposition[2])) {
    return decodeURIComponent(contentDisposition[1] || contentDisposition[2]);
  }
  return 'benchmark_data.xlsx'; // Fallback default
};

export const filterApi = {
  getFilterOptions: async (): Promise<FilterOptions> => {
    const response = await apiClient.get<FilterOptions>('/projects/filters');
    return response.data;
  },
  applyFilters: async ({
    filters,
    page,
    limit = 10,
  }: ApplyFiltersParams): Promise<FilterResponse> => {
    const response = await apiClient.post<FilterResponse>('/projects/filtered', {
      filters,
      page,
      limit,
    });
    return response.data;
  },
  downloadFilteredData: async (filters: any): Promise<void> => {
    try {
      const response = await apiClient.post(
        '/projects/filtered/download',
        {
          filters,
        },
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const filename = getFilenameFromHeader(response.headers['content-disposition']);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading filtered data:', error);
      throw error;
    }
  },

  // Chart data API functions
  getBarChartData: async ({
    filters,
    deselectedRows,
  }: ChartDataParams): Promise<BarChartData[]> => {
    const response = await apiClient.post('/projects/filtered/area-duration-average', {
      filters,
      deselectedRows,
    });
    return response.data;
  },

  getScatterChartData: async ({
    filters,
    deselectedRows,
  }: ChartDataParams): Promise<ScatterChartData[]> => {
    const response = await apiClient.post('/projects/filtered/gfa-over-months', {
      filters,
      deselectedRows,
    });

    // Map the API response to the required format
    return response.data.map((item: any) => ({
      gfa: item.gfa,
      planned: item.totalplannedduration,
      actual: item.totalactualduration,
      projectId: item.projectid,
      projectName: item.projectname,
      metric: item.metric,
    }));
  },

  getGanttChartData: async ({
    filters,
    deselectedRows,
  }: ChartDataParams): Promise<GanttChartData[]> => {
    const response = await apiClient.post('/projects/filtered/avg-timeline', {
      filters,
      deselectedRows,
    });

    // Convert API data to Gantt chart format
    return response.data.map((item: any) => ({
      name: item.label,
      phase: item.phase,
      duration: item.average_duration,
      startTime: item.start_time,
      color: item.color,
      metric: item.metric,
    }));
  },

  getDonutChartData: async (): Promise<DonutChartData[]> => {
    // This endpoint doesn't need filters or deselectedRows as it shows all projects
    const response = await apiClient.post('/projects/filtered/market-share', {
      filters: {},
      deselectedRows: [],
    });
    return response.data;
  },
};
