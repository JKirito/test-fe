export type CostCode = {
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
};
