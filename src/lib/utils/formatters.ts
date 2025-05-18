// Formatter utilities
export const formatCurrency = (value: number): string => {
  // Maintain precision for financial values
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2, // Show at least 2 decimal places
    maximumFractionDigits: 2, // Cap at 2 decimal places for display
  }).format(value);
};

const formatPercentage = (value: number | null | undefined): string => {
  if (value == null) return '-';
  return new Intl.NumberFormat('en-AU', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '-';
  return new Intl.NumberFormat('en-AU').format(value);
};

const formatArea = (value: number | null | undefined): string => {
  if (value == null) return '-';
  return `${formatNumber(value)} m²`;
};

export { formatPercentage, formatNumber, formatArea };
