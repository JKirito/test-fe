import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IBenchmarkProject } from '../types';
import { cn } from '@/lib/utils/tailwind';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode,
  Header,
} from '@tanstack/react-table';
import { calculateContentWidth } from '@/lib/utils/tableUtils';

interface BenchmarkTableProps {
  data: IBenchmarkProject[];
  onSelectionChange?: (selectedProjects: IBenchmarkProject[]) => void;
}

const BenchmarkTable: React.FC<BenchmarkTableProps> = ({ data, onSelectionChange }) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  // Save column widths when they change
  useEffect(() => {
    localStorage.setItem('benchmarkTableColumnSizing', JSON.stringify(columnSizing));
  }, [columnSizing]);

  const handleHeaderClick = useCallback(
    (header: Header<IBenchmarkProject, unknown>) => {
      const column = header.column;
      if (!column.getCanResize()) return;

      const maxWidth = calculateContentWidth(column, data);
      const newSize = Math.max(maxWidth, column.columnDef.minSize ?? 80);

      setColumnSizing((prev) => ({
        ...prev,
        [column.id]: newSize,
      }));
    },
    [data]
  );

  // Example of column width configuration
  const COLUMN_WIDTHS = {
    select: 50,
    projectCode: 150,
    projectName: 200,
    description: 300,
    sector: 150,
    subSector: 180,
    constructionCost: 180,
    source: 150,
    levelOfEstimate: 180,
    year: 100,
    procurementModel: 180,
    landType: 150,
    siteArea: 150,
    feca: 150,
    uca: 150,
  } as const;

  const columnHelper = createColumnHelper<IBenchmarkProject>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={(e) => {
              table.toggleAllRowsSelected(e.target.checked);
              const newSelection = new Set<string>(e.target.checked ? data.map((p) => p._id) : []);
              setSelectedRows(newSelection);
              onSelectionChange?.(e.target.checked ? data : []);
            }}
            className="h-4 w-4 rounded border-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.toggleSelected(e.target.checked);
              const newSelection = new Set(selectedRows);
              const project = data[row.index];
              if (e.target.checked) {
                newSelection.add(project._id);
              } else {
                newSelection.delete(project._id);
              }
              setSelectedRows(newSelection);
              onSelectionChange?.(data.filter((p) => newSelection.has(p._id)));
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        size: COLUMN_WIDTHS.select,
        minSize: Math.floor(COLUMN_WIDTHS.select * 0.8),
      }),
      columnHelper.accessor('Project Code', {
        header: 'Project Code',
        size: COLUMN_WIDTHS.projectCode,
        minSize: Math.floor(COLUMN_WIDTHS.projectCode * 0.8),
      }),
      columnHelper.accessor('Project Name', {
        header: 'Project Name',
        size: COLUMN_WIDTHS.projectName,
        minSize: Math.floor(COLUMN_WIDTHS.projectName * 0.8),
      }),
      columnHelper.accessor('Brief Project Description', {
        header: 'Description',
        cell: (info) => <div className="whitespace-normal break-words">{info.getValue()}</div>,
        size: COLUMN_WIDTHS.description,
        minSize: Math.floor(COLUMN_WIDTHS.description * 0.8),
      }),
      columnHelper.accessor('Sector', {
        header: 'Sector',
        size: COLUMN_WIDTHS.sector,
        minSize: Math.floor(COLUMN_WIDTHS.sector * 0.8),
      }),
      columnHelper.accessor('Sub-Sector (Leave Blank if TBA)', {
        header: 'Sub-Sector',
        size: COLUMN_WIDTHS.subSector,
        minSize: Math.floor(COLUMN_WIDTHS.subSector * 0.8),
      }),
      columnHelper.accessor('Construction Cost', {
        header: 'Construction Cost',
        cell: (info) => formatCurrency(info.getValue()),
        size: COLUMN_WIDTHS.constructionCost,
        minSize: Math.floor(COLUMN_WIDTHS.constructionCost * 0.8),
      }),
      columnHelper.accessor('Source of Construction Cost', {
        header: 'Source',
        size: COLUMN_WIDTHS.source,
        minSize: Math.floor(COLUMN_WIDTHS.source * 0.8),
      }),
      columnHelper.accessor('Level of Estimate', {
        header: 'Level of Estimate',
        size: COLUMN_WIDTHS.levelOfEstimate,
        minSize: Math.floor(COLUMN_WIDTHS.levelOfEstimate * 0.8),
      }),
      columnHelper.accessor('Year of Head Contract Execution (Leave Blank if not executed)', {
        header: 'Year',
        size: COLUMN_WIDTHS.year,
        minSize: Math.floor(COLUMN_WIDTHS.year * 0.8),
      }),
      columnHelper.accessor('Procurement Model', {
        header: 'Procurement Model',
        size: COLUMN_WIDTHS.procurementModel,
        minSize: Math.floor(COLUMN_WIDTHS.procurementModel * 0.8),
      }),
      columnHelper.accessor('Land Type', {
        header: 'Land Type',
        size: COLUMN_WIDTHS.landType,
        minSize: Math.floor(COLUMN_WIDTHS.landType * 0.8),
      }),
      columnHelper.accessor('Site area (m2)', {
        header: 'Site Area (m²)',
        cell: (info) => formatNumber(info.getValue()),
        size: COLUMN_WIDTHS.siteArea,
        minSize: Math.floor(COLUMN_WIDTHS.siteArea * 0.8),
      }),
      columnHelper.accessor('Fully Enclosed Covered Area (FECA)', {
        header: 'FECA (m²)',
        cell: (info) => formatNumber(info.getValue()),
        size: COLUMN_WIDTHS.feca,
        minSize: Math.floor(COLUMN_WIDTHS.feca * 0.8),
      }),
      columnHelper.accessor('Unenclosed Covered Area (UCA)', {
        header: 'UCA (m²)',
        cell: (info) => formatNumber(info.getValue()),
        size: COLUMN_WIDTHS.uca,
        minSize: Math.floor(COLUMN_WIDTHS.uca * 0.8),
      }),
    ],
    [columnHelper, data, onSelectionChange, selectedRows]
  );

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 80, // Minimum column width
      maxSize: 1000, // Maximum column width
      size: 150, // Default column width
    },
  });

  // Calculate total table width based on column sizes
  const tableWidth = useMemo(() => {
    return table.getAllColumns().reduce((acc, column) => {
      return acc + column.getSize();
    }, 0);
  }, [table]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-gray-200 bg-white rounded-lg">
        <table
          className="w-full divide-y divide-gray-200"
          style={{
            width: `${tableWidth}px`,
            minWidth: '100%',
          }}
        >
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(
                      'sticky top-0 px-4 py-3 text-left text-sm font-medium text-gray-900',
                      header.column.getCanResize() && 'select-none relative group'
                    )}
                    style={{
                      width: header.getSize(),
                    }}
                    onClick={() => handleHeaderClick(header)}
                    title="Click to auto-fit column"
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
                          'bg-gray-300 opacity-0 group-hover:opacity-100',
                          header.column.getIsResizing() && 'bg-primaryBlue opacity-100'
                        )}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900"
                    style={{
                      width: `${cell.column.getSize()}px`,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BenchmarkTable;

function formatNumber(value: number | null | undefined): string {
  if (value == null) return '-';
  return value.toLocaleString('en-AU');
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
