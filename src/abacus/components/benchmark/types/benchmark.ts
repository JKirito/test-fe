export interface BenchmarkItem {
  icms_code: string;
  total_amount: number;
  average_rate: number;
}

export interface BenchmarkResponse {
  message: string;
  data: {
    benchmarks: {
      [projectCode: string]: {
        total_rate: number;
        icms_code: string;
        description?: string;
        total_amount: number;
        average_rate: number;
      }[];
    };
    codes: {
      master_code: string;
      master_description: string;
      master_grouping: string | null;
    }[];
  };
}

export interface ProcessedBenchmarkData {
  code: string;
  description: string;
  projects: {
    [key: string]: {
      total: number;
      ratePerXX: number;
      excl: boolean;
    };
  };
  average: {
    total: number;
    ratePerXX: number;
  };
  subRows: ProcessedBenchmarkData[];
  level: number;
}
