import React from 'react';
import { flexRender, Header, Table } from '@tanstack/react-table';
import { ProcessedBenchmarkData } from '../../types/benchmark';
import { COLUMN_WIDTHS } from './core/types';

interface TableHeaderProps {
  table: Table<ProcessedBenchmarkData>;
}

// Helper function to render a single header cell with pinning styles
const renderHeaderCell = (
  header: Header<ProcessedBenchmarkData, unknown>
  // table parameter removed as it's not used
) => {
  const isPinned = header.column.getIsPinned();
  const isLeftPinned = isPinned === 'left';
  const isRightPinned = isPinned === 'right';

  // Correct offset calculation
  const leftOffset = isLeftPinned ? header.getStart() : undefined;
  // For right-pinned, use 0 for rightmost column, or calculate based on column ID
  let rightOffset = undefined;
  if (isRightPinned) {
    if (header.column.id === 'average.ratePerXX') {
      // Rightmost column
      rightOffset = 0;
    } else if (header.column.id === 'average.total') {
      // Position to the left of the Rate/m² column
      rightOffset = COLUMN_WIDTHS.averageRate;
    } else if (header.column.id === 'average') {
      // Average parent column - set to 0 to align with the right edge
      rightOffset = 0;
    }
  }

  // Construct BEM class names
  let thClasses = 'benchmark-table__th';
  if (isPinned) thClasses += ' benchmark-table__th--pinned';
  if (isRightPinned) thClasses += ' benchmark-table__th--right-pinned';

  // Add project class for project headers
  // Check if this is a project column by looking at the ID pattern
  const isProjectHeader =
    /^[A-Z0-9]+$/.test(header.column.id) ||
    header.column.id.includes('_total') ||
    header.column.id.includes('_rate') ||
    header.column.id.includes('_excl');
  if (isProjectHeader) thClasses += ' benchmark-table__th--project';

  // Add main project header class for top-level project headers (not subheaders)
  const isMainProjectHeader =
    /^[A-Z0-9]+$/.test(header.column.id) || header.column.id === 'average';
  if (isMainProjectHeader) thClasses += ' benchmark-table__th--project-main';

  // Add checkbox cell class for the exclude column
  const isCheckboxColumn = header.column.id.includes('_excl');
  if (isCheckboxColumn) thClasses += ' benchmark-table__checkbox-cell';

  return (
    <th
      key={header.id}
      colSpan={header.colSpan}
      className={thClasses}
      style={{
        width: header.getSize(),
        minWidth: header.getSize(),
        maxWidth: header.getSize(),
        left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
        right: rightOffset !== undefined ? `${rightOffset}px` : undefined,
      }}
    >
      {header.isPlaceholder ? null : (
        <div className="benchmark-table__th-content">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      )}
    </th>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ table }) => {
  const headerGroups = table.getHeaderGroups();

  return (
    // Apply BEM classes for the thead
    <thead className="benchmark-table__thead">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id} className="benchmark-table__tr">
          {/* Render Left Pinned Headers */}
          {headerGroup.headers
            .filter((h) => h.column.getIsPinned() === 'left')
            .map((header) => renderHeaderCell(header))}

          {/* Render Center (Scrollable) Headers */}
          {headerGroup.headers
            .filter((h) => !h.column.getIsPinned())
            .map((header) => renderHeaderCell(header))}

          {/* Render Right Pinned Headers */}
          {headerGroup.headers
            .filter((h) => h.column.getIsPinned() === 'right')
            .map((header) => renderHeaderCell(header))}
        </tr>
      ))}
    </thead>
  );
};
