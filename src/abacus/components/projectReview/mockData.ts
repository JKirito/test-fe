export const mockData = [
  {
    code: '1',
    description: 'ACQUISITION COSTS',
    projects: {
      '1': { total: 1000000, ratePerXX: 100, excl: false },
      '2': { total: 1200000, ratePerXX: 120, excl: true },
      '3': { total: 950000, ratePerXX: 95, excl: false },
      '4': { total: 1100000, ratePerXX: 110, excl: false },
      '5': { total: 1050000, ratePerXX: 105, excl: true },
    },
    average: { total: 1060000, ratePerXX: 106 },
  },
  {
    code: '2',
    description: 'CONSTRUCTION COSTS',
    projects: {
      '1': { total: 5000000, ratePerXX: 500, excl: false },
      '2': { total: 5500000, ratePerXX: 550, excl: false },
      '3': { total: 4800000, ratePerXX: 480, excl: false },
      '4': { total: 5200000, ratePerXX: 520, excl: false },
      '5': { total: 5100000, ratePerXX: 510, excl: false },
    },
    average: { total: 5120000, ratePerXX: 512 },
  },
];
