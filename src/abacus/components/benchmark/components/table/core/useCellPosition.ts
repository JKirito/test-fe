import { useCallback } from 'react';
import { Header, Cell } from '@tanstack/react-table';
import { ProcessedBenchmarkData } from '../../../types/benchmark';
import { COLUMN_WIDTHS, CellPosition } from './types';

export const useCellPosition = () => {
  // Calculate position for header cells
  const getHeaderPosition = useCallback(
    (header: Header<ProcessedBenchmarkData, unknown>): CellPosition => {
      let stickyClass = '';
      let leftPosition = '';
      let rightPosition = '';
      let borderClass = '';

      // Remove debug logs for production
      // // console.log('Header ID:', header.id, 'Column ID:', header.column.id);

      // Left frozen columns
      if (header.column.id === 'code') {
        stickyClass = 'sticky left-0 z-30';
        leftPosition = '0px';
        borderClass = 'border-r border-gray-200';
      } else if (header.column.id === 'description') {
        stickyClass = 'sticky z-30';
        leftPosition = `${COLUMN_WIDTHS.code}px`;
        borderClass = 'border-r border-gray-200';
      }
      // Average group header - needs to span both columns
      else if (header.column.id === 'average') {
        stickyClass = 'sticky right-0 z-30';
        rightPosition = '0px';
        borderClass = 'border-l border-gray-200';
        // Set width to match both columns
        header.column.columnDef.size = COLUMN_WIDTHS.averageTotal + COLUMN_WIDTHS.averageRate;
      }
      // Average Total column
      else if (
        header.column.id === 'average.total' ||
        header.id.includes('average.total') ||
        (header.id.includes('average_') && header.id.includes('_total'))
      ) {
        stickyClass = 'sticky right-0 z-30';
        rightPosition = `${COLUMN_WIDTHS.averageRate}px`;
        borderClass = 'border-l border-gray-200';
      }
      // Average Rate column
      else if (
        header.column.id === 'average.ratePerXX' ||
        header.id.includes('average.ratePerXX') ||
        (header.id.includes('average_') && header.id.includes('_rate'))
      ) {
        stickyClass = 'sticky right-0 z-30';
        rightPosition = '0px';
      }

      return { stickyClass, leftPosition, rightPosition, borderClass };
    },
    []
  );

  // Calculate position for body cells
  const getCellPosition = useCallback(
    (cell: Cell<ProcessedBenchmarkData, unknown>, rowDepth: number): CellPosition => {
      let stickyClass = '';
      let leftPosition = '';
      let rightPosition = '';
      let borderClass = '';

      // Remove debug logs for production
      // // console.log('Cell ID:', cell.id, 'Column ID:', cell.column.id);

      // Determine if this is a fixed column for background color
      const isFixed =
        cell.column.id === 'code' ||
        cell.column.id === 'description' ||
        cell.column.id === 'average.total' ||
        cell.column.id === 'average.ratePerXX' ||
        cell.column.id.includes('average_') ||
        cell.id.includes('average.total') ||
        cell.id.includes('average.ratePerXX');

      // Left frozen columns
      if (cell.column.id === 'code') {
        stickyClass = 'sticky left-0 z-20';
        leftPosition = '0px';
        borderClass = 'border-r border-gray-200';
      } else if (cell.column.id === 'description') {
        stickyClass = 'sticky z-20';
        leftPosition = `${COLUMN_WIDTHS.code}px`;
        borderClass = 'border-r border-gray-200';
      }
      // Average Total column
      else if (
        cell.column.id === 'average.total' ||
        cell.id.includes('average.total') ||
        (cell.column.id.includes('average_') && cell.column.id.includes('_total'))
      ) {
        stickyClass = 'sticky right-0 z-20';
        rightPosition = `${COLUMN_WIDTHS.averageRate}px`;
        borderClass = 'border-l border-gray-200';
      }
      // Average Rate column
      else if (
        cell.column.id === 'average.ratePerXX' ||
        cell.id.includes('average.ratePerXX') ||
        (cell.column.id.includes('average_') && cell.column.id.includes('_rate'))
      ) {
        stickyClass = 'sticky right-0 z-20';
        rightPosition = '0px';
      }

      const bgColor = isFixed
        ? rowDepth > 0
          ? 'rgb(249 250 251)' // bg-gray-50
          : 'rgb(255 255 255)' // white
        : undefined;

      return { stickyClass, leftPosition, rightPosition, borderClass, bgColor };
    },
    []
  );

  return { getHeaderPosition, getCellPosition };
};
