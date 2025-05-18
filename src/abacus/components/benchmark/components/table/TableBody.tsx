import React from 'react';
import { flexRender, Cell, Table } from '@tanstack/react-table';
import { ProcessedBenchmarkData } from '../../types/benchmark';
import { COLUMN_WIDTHS } from './core/types';

interface TableBodyProps {
  table: Table<ProcessedBenchmarkData>;
}

const renderDataCell = (
  cell: Cell<ProcessedBenchmarkData, unknown>
  // table parameter removed as it's not used
) => {
  const isPinned = cell.column.getIsPinned();
  const isLeftPinned = isPinned === 'left';
  const isRightPinned = isPinned === 'right';

  const leftOffset = isLeftPinned ? cell.column.getStart() : undefined;
  // For right-pinned, use 0 for rightmost column, or calculate based on column ID
  let rightOffset = undefined;
  if (isRightPinned) {
    if (cell.column.id === 'average.ratePerXX') {
      // Rightmost column
      rightOffset = 0;
    } else if (cell.column.id === 'average.total') {
      // Position to the left of the Rate/m² column
      rightOffset = COLUMN_WIDTHS.averageRate;
    } else if (cell.column.id === 'average') {
      // Average parent column - set to 0 to align with the right edge
      rightOffset = 0;
    }
  }

  // Construct BEM class names
  let tdClasses = 'benchmark-table__td';
  if (isPinned) tdClasses += ' benchmark-table__td--pinned';
  if (isRightPinned) tdClasses += ' benchmark-table__td--right-pinned';

  // Add checkbox cell class for the exclude column
  const isCheckboxColumn = cell.column.id.includes('_excl');
  if (isCheckboxColumn) tdClasses += ' benchmark-table__checkbox-cell';

  // Add description cell class for left alignment
  const isDescriptionColumn = cell.column.id === 'description';
  if (isDescriptionColumn) tdClasses += ' benchmark-table__td--description';

  return (
    <td
      key={cell.id}
      className={tdClasses}
      style={{
        width: cell.column.getSize(),
        minWidth: cell.column.getSize(),
        maxWidth: cell.column.getSize(),
        left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
        right: rightOffset !== undefined ? `${rightOffset}px` : undefined,
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ table }) => {
  const rows = table.getRowModel().rows;

  return (
    <tbody className="benchmark-table__tbody">
      {rows.map((row) => {
        return (
          <tr key={row.id} className="benchmark-table__tr">
            {row.getLeftVisibleCells().map((cell) => renderDataCell(cell))}
            {row.getCenterVisibleCells().map((cell) => renderDataCell(cell))}
            {row.getRightVisibleCells().map((cell) => renderDataCell(cell))}
          </tr>
        );
      })}
    </tbody>
  );
};
