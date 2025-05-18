import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ExpandedState,
  ColumnPinningState,
} from '@tanstack/react-table';
import { ProcessedBenchmarkData } from '../types/benchmark';
import { IBenchmarkProject } from '../types';
import { useTableColumns } from './table/core/useTableColumns';
import { useTableData } from './table/core/useTableData';
import { TableContainer } from './table/TableContainer';
import { TableHeader } from './table/TableHeader';
import { TableBody } from './table/TableBody';
import { useBenchmark } from '../BenchmarkContext';

interface BenchmarkResultsTableProps {
  data: ProcessedBenchmarkData[];
  selectedProjects: IBenchmarkProject[];
  onDataChange?: (updatedData: ProcessedBenchmarkData[]) => void;
}

const BenchmarkResultsTable: React.FC<BenchmarkResultsTableProps> = ({
  data,
  selectedProjects,
  onDataChange,
}) => {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  // Initialize column pinning state with correct column IDs
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['code', 'description'],
    right: ['average', 'average.total', 'average.ratePerXX'],
  });

  // Force update column pinning when the component mounts
  useEffect(() => {
    // This ensures pinning is properly applied after initial render
    setColumnPinning({
      left: ['code', 'description'],
      right: ['average', 'average.total', 'average.ratePerXX'],
    });
  }, []);
  const { state } = useBenchmark();
  const { excludedRows, maskProjectNames } = state;
  const { setShouldRecalculate } = useTableData(data, onDataChange);
  const columns = useTableColumns(selectedProjects, setShouldRecalculate, maskProjectNames);

  // Force recalculation when excluded rows change
  useEffect(() => {
    setShouldRecalculate(true);
  }, [excludedRows, setShouldRecalculate]);

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      columnPinning,
    },
    onExpandedChange: setExpanded,
    onColumnPinningChange: setColumnPinning,
    enableColumnPinning: true,
    getSubRows: (row) => row.subRows ?? [],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Prevent auto-resetting of table state
    autoResetAll: false,
  });

  // Force pin columns after table is created
  useEffect(() => {
    if (table) {
      // Pin columns directly to ensure they're properly pinned
      table.getColumn('average')?.pin('right');
      table.getColumn('average.total')?.pin('right');
      table.getColumn('average.ratePerXX')?.pin('right');
    }
  }, [table]);

  return (
    <TableContainer projectCount={selectedProjects.length}>
      <TableHeader table={table} />
      <TableBody table={table} />
    </TableContainer>
  );
};

export default BenchmarkResultsTable;
