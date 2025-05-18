import { Column } from '@tanstack/react-table';

// Helper function to get text width using canvas
const getTextWidth = (text: string, font: string = '14px -apple-system'): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;

  context.font = font;
  return context.measureText(text).width;
};

// Calculate the maximum content width for a column
export const calculateContentWidth = <T extends object>(
  column: Column<T, unknown>,
  data: T[],
  padding: number = 32 // Default padding (16px on each side)
): number => {
  // Get header width
  const headerWidth = getTextWidth(String(column.columnDef.header || ''));

  // Get maximum content width
  const maxContentWidth = data.reduce((max, row) => {
    let displayValue: string;

    try {
      // Get the raw value using accessorFn
      const value = column.accessorFn?.(row, 0);

      // Format the value based on column type
      if (typeof value === 'number') {
        // Handle number formatting if needed
        displayValue = value.toLocaleString();
      } else {
        // Convert to string, handle null/undefined
        displayValue = String(value || '');
      }
    } catch (error) {
      displayValue = '';
      console.warn('Error calculating cell width:', error);
    }

    const contentWidth = getTextWidth(displayValue);
    return Math.max(max, contentWidth);
  }, 0);

  // Return the maximum of header width and content width, plus padding
  return Math.max(headerWidth, maxContentWidth) + padding;
};
