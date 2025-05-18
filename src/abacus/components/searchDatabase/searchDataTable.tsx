import React, { useState, useMemo } from 'react';
import { IBenchmarkProject } from '../benchmark/types';
import './SearchDataTable.scss';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode,
} from '@tanstack/react-table';
import DataRequestNotification from '@/components/data-request-notification/DataRequestNotification';

interface SearchDataTableProps {
  data: IBenchmarkProject[];
}

const SearchDataTable: React.FC<SearchDataTableProps> = ({ data }) => {
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [columnSizing, setColumnSizing] = useState({});

  const columnHelper = createColumnHelper<IBenchmarkProject>();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-AU').format(value);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('Project Code', {
        header: 'Project Code',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 120,
        minSize: 100,
      }),
      columnHelper.accessor('Project Name', {
        header: 'Project Name',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 200,
        minSize: 150,
      }),
      columnHelper.accessor('Brief Project Description', {
        header: 'Description',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--description">
            {info.getValue()}
          </div>
        ),
        size: 350, // Slightly smaller to prevent overflow
        minSize: 200,
        maxSize: 500, // Limit maximum size
      }),
      columnHelper.accessor('Sector', {
        header: 'Sector',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 100,
        minSize: 80,
      }),
      columnHelper.accessor('Sub-Sector (Leave Blank if TBA)', {
        header: 'Sub-Sector',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 150,
        minSize: 120,
      }),
      columnHelper.accessor('Construction Cost', {
        header: 'Construction Cost',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {formatCurrency(info.getValue())}
          </div>
        ),
        size: 150,
        minSize: 120,
      }),
      columnHelper.accessor('Source of Construction Cost', {
        header: 'Source',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 120,
        minSize: 100,
      }),
      columnHelper.accessor('Level of Estimate', {
        header: 'Level of Estimate',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 180,
        minSize: 150,
      }),
      columnHelper.accessor('Year of Head Contract Execution (Leave Blank if not executed)', {
        header: 'Year',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 100,
        minSize: 80,
      }),
      columnHelper.accessor('Procurement Model', {
        header: 'Procurement Model',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 180,
        minSize: 150,
      }),
      columnHelper.accessor('Land Type', {
        header: 'Land Type',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {info.getValue()}
          </div>
        ),
        size: 120,
        minSize: 100,
      }),
      columnHelper.accessor('Site area (m2)', {
        header: 'Site Area (m²)',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {formatNumber(info.getValue())}
          </div>
        ),
        size: 120,
        minSize: 100,
      }),
      columnHelper.accessor('Fully Enclosed Covered Area (FECA)', {
        header: 'FECA (m²)',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {formatNumber(info.getValue())}
          </div>
        ),
        size: 120,
        minSize: 100,
      }),
      columnHelper.accessor('Unenclosed Covered Area (UCA)', {
        header: 'UCA (m²)',
        cell: (info) => (
          <div className="abacus-search-data-table__cell-content abacus-search-data-table__cell-content--wrap">
            {formatNumber(info.getValue())}
          </div>
        ),
        size: 120,
        minSize: 100,
      }),
    ],
    [columnHelper]
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
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50, // Minimum column width
      maxSize: 1000, // Maximum column width
      size: 150, // Default column width
    },
  });

  return (
    <div className="abacus-search-data-table">
      <div className="abacus-search-data-table__wrapper">
        <table className="abacus-search-data-table__table">
          <thead className="abacus-search-data-table__thead">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={`abacus-search-data-table__th ${header.column.getCanResize() ? 'abacus-search-data-table__th--resizable' : ''}`}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    <div className="abacus-search-data-table__th__content">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={() => header.column.resetSize()}
                        className={`abacus-search-data-table__th__resize-handle ${header.column.getIsResizing() ? 'abacus-search-data-table__th__resize-handle--resizing' : ''}`}
                        title="Drag to resize or double-click to reset"
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="abacus-search-data-table__tbody">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="abacus-search-data-table__tr">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`abacus-search-data-table__td ${cell.column.id === 'Brief Project Description' ? 'abacus-search-data-table__td--description' : ''}`}
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="abacus-search-data-table__empty-message">
            <DataRequestNotification />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDataTable;
