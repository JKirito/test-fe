// eslint-disable react-hooks/exhaustive-deps
import { useMemo, memo, useState, useRef, useCallback, useLayoutEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Table,
} from '@tanstack/react-table';
import { CostCode } from './types';

type Row = CostCode;

interface TableBodyProps {
  table: Table<Row>;
  onExcludeChange: (projectId: string, rowCode: string, value: boolean) => void;
}

// Memoized table body component
const TableBody = memo(
  ({ table }: TableBodyProps) => {
    return (
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b hover:bg-gray-50">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className="border-x whitespace-nowrap px-4 py-3 text-sm text-gray-900"
                style={{
                  width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  },
  (_prev, _next) => false // Force re-render on all changes
);

interface ScrollPosition {
  left: number;
  top: number;
}

interface RenderResultTableProps {
  data: Row[];
  onExcludeChange: (projectId: string, rowCode: string, value: boolean) => void;
}

const RenderResultTable = ({ data, onExcludeChange }: RenderResultTableProps) => {
  const [columnSizing, setColumnSizing] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<ScrollPosition>({ left: 0, top: 0 });
  const isExcludeChangeRef = useRef(false);

  // Memoize column helper to prevent unnecessary column recreations
  const columnHelper = useMemo(() => createColumnHelper<Row>(), []);

  // Update scroll position ref when scrolling
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      scrollPositionRef.current = {
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop,
      };
    }
  }, []);

  // Restore scroll position after render
  useLayoutEffect(() => {
    if (containerRef.current && isExcludeChangeRef.current) {
      // Use the ref value directly
      containerRef.current.scrollLeft = scrollPositionRef.current.left;
      containerRef.current.scrollTop = scrollPositionRef.current.top;
      isExcludeChangeRef.current = false;
    }
  }, [data]); // Only depend on data changes

  const handleExcludeChange = useCallback(
    (projectId: string, rowCode: string, value: boolean) => {
      if (containerRef.current) {
        // Store scroll position directly in ref
        scrollPositionRef.current = {
          left: containerRef.current.scrollLeft,
          top: containerRef.current.scrollTop,
        };
        isExcludeChangeRef.current = true;
      }
      onExcludeChange(projectId, rowCode, value);
    },
    [onExcludeChange]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        header: 'Code',
        cell: (info) => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        size: 200,
      }),
      // Project 1-5
      ...Array.from({ length: 1 }, (_, i) => {
        const projectId = (i + 1).toString();
        return columnHelper.group({
          id: `project${projectId}`,
          header: `Project ${projectId}`,
          columns: [
            columnHelper.accessor((row) => row.projects[projectId]?.total, {
              id: `project${projectId}Total`,
              header: 'Total Rate per (XX)',
              size: 120,
              cell: (info) => info.getValue()?.toLocaleString() ?? '-',
            }),
            columnHelper.accessor((row) => row.projects[projectId]?.ratePerXX, {
              id: `project${projectId}Rate`,
              header: 'Rate per (XX)',
              size: 120,
              cell: (info) => info.getValue()?.toLocaleString() ?? '-',
            }),
            columnHelper.accessor((row) => row.projects[projectId]?.excl, {
              id: `project${projectId}Excl`,
              header: 'Excl',
              size: 60,
              cell: (info) => {
                const checked = info.getValue() ?? false;
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      handleExcludeChange(projectId, info.row.original.code, e.target.checked)
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                );
              },
            }),
          ],
        });
      }),
    ],
    [columnHelper, handleExcludeChange]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 60,
      maxSize: 1000,
    },
  });

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const vars: { [key: string]: number } = {};

    headers.forEach((header) => {
      vars[`--header-${header.id}-size`] = header.getSize();
      vars[`--col-${header.column.id}-size`] = header.column.getSize();
    });

    return vars;
  }, [table.getState().columnSizing, table.getState().columnSizingInfo, table.getFlatHeaders]);

  return (
    <div className="rounded-md border">
      <div ref={containerRef} onScroll={handleScroll} className="overflow-auto max-h-[600px]">
        <table
          className="w-full border-collapse relative"
          style={{
            ...columnSizeVars,
            width: table.getTotalSize(),
          }}
        >
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="relative border-x px-4 py-3 text-left text-sm font-medium text-gray-900 select-none bg-gray-50"
                    style={{
                      width:
                        header.colSpan === 1
                          ? `calc(var(--header-${header.id}-size) * 1px)`
                          : undefined,
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => header.column.resetSize()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-gray-300 opacity-0 hover:opacity-100 ${
                          header.column.getIsResizing() ? 'opacity-100 bg-blue-500' : ''
                        }`}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <TableBody table={table} onExcludeChange={handleExcludeChange} />
        </table>
      </div>
    </div>
  );
};

export default RenderResultTable;
