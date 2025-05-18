import { useMemo, useCallback } from 'react';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { ProcessedBenchmarkData } from '../../../types/benchmark';
import { IBenchmarkProject } from '../../../types';
import { COLUMN_WIDTHS } from './types';
import { useBenchmark } from '../../../BenchmarkContext';
import { ChevronRight, ChevronDown, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

// Add this type to avoid the GroupColumnDefBase error
type TableColumns = ColumnDef<ProcessedBenchmarkData, any>[];

export const useTableColumns = (
  selectedProjects: IBenchmarkProject[],
  setShouldRecalculate: (value: boolean) => void,
  maskProjectNames?: boolean
): TableColumns => {
  const { state, dispatch } = useBenchmark();
  const { excludedRows, excludedProjects, excludedRates } = state;

  // Use the maskProjectNames parameter if provided, otherwise use the state value
  const shouldMaskNames =
    maskProjectNames !== undefined ? maskProjectNames : state.maskProjectNames;

  const columnHelper = createColumnHelper<ProcessedBenchmarkData>();

  const handleExcludeChange = useCallback(
    (rowCode: string, projectCode: string) => {
      const key = `${rowCode}-${projectCode}`;
      dispatch({ type: 'TOGGLE_EXCLUDED_ROW', payload: key });
      setShouldRecalculate(true);
    },
    [dispatch, setShouldRecalculate]
  );

  const handleExcludeProject = useCallback(
    (projectCode: string) => {
      dispatch({ type: 'TOGGLE_EXCLUDED_PROJECT', payload: projectCode });
      setShouldRecalculate(true);
    },
    [dispatch, setShouldRecalculate]
  );

  const handleExcludeRate = useCallback(
    (projectCode: string) => {
      dispatch({ type: 'TOGGLE_EXCLUDED_RATE', payload: projectCode });
      setShouldRecalculate(true);
    },
    [dispatch, setShouldRecalculate]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        header: 'Code',
        size: COLUMN_WIDTHS.code,
        cell: ({ row }) => {
          const value = row.original as ProcessedBenchmarkData;
          const hasChildren = value.subRows && value.subRows.length > 0;
          const depth = row.depth;
          const paddingLeft = depth * 20;

          return (
            <div className="flex items-center" style={{ paddingLeft: `${paddingLeft}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => row.toggleExpanded()}
                  className="mr-2 p-1 hover:bg-gray-100 rounded"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-16 w-16" />
                  ) : (
                    <ChevronRight className="h-16 w-16" />
                  )}
                </button>
              ) : (
                <span className="w-6" /> // Empty space for alignment
              )}
              <span>{value.code}</span>
            </div>
          );
        },
        meta: { frozen: 'left' },
      }),
      columnHelper.accessor('description', {
        header: () => <div className="benchmark-table__description-header">Description</div>,
        size: COLUMN_WIDTHS.description,
        meta: { frozen: 'left' },
        cell: (info) => {
          return <div className="benchmark-table__description-cell">{info.getValue()}</div>;
        },
      }),
      ...selectedProjects.map((project) =>
        columnHelper.group({
          id: project.project_code,
          header: () => (
            <div className="flex items-center gap-1 justify-between benchmark-table__project-header">
              <span
                className={
                  excludedProjects.has(project.project_code)
                    ? 'text-gray-400 line-through benchmark-table__project-text'
                    : 'benchmark-table__project-text'
                }
              >
                {shouldMaskNames ? '********' : project['Project Name']}
              </span>
              <button
                onClick={() => handleExcludeProject(project.project_code)}
                className={`p-0.5 rounded ${excludedProjects.has(project.project_code) ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'}`}
                title={
                  excludedProjects.has(project.project_code) ? 'Include project' : 'Exclude project'
                }
              >
                <EyeOff className="h-3 w-3" />
              </button>
            </div>
          ),
          columns: [
            columnHelper.accessor((row) => row.projects[project.project_code]?.total ?? 0, {
              id: `${project.project_code}_total`,
              header: () => <span className="benchmark-table__project-text">Total</span>,
              cell: (info) => {
                const isProjectExcluded = excludedProjects.has(project.project_code);
                return (
                  <span className={isProjectExcluded ? 'text-gray-400' : ''}>
                    {formatCurrency(info.getValue())}
                  </span>
                );
              },
              size: COLUMN_WIDTHS.projectColumn,
            }),
            columnHelper.accessor((row) => row.projects[project.project_code]?.ratePerXX ?? 0, {
              id: `${project.project_code}_rate`,
              header: () => (
                <div className="benchmark-table__rate-header">
                  <span
                    className={
                      excludedRates.has(project.project_code)
                        ? 'text-gray-400 line-through benchmark-table__project-text'
                        : 'benchmark-table__project-text'
                    }
                  >
                    Rate/m²
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExcludeRate(project.project_code);
                    }}
                    className={`p-0.5 rounded ${excludedRates.has(project.project_code) ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'}`}
                    title={
                      excludedRates.has(project.project_code) ? 'Include rates' : 'Exclude rates'
                    }
                  >
                    <EyeOff className="h-3 w-3" />
                  </button>
                </div>
              ),
              cell: (info) => {
                const isProjectExcluded = excludedProjects.has(project.project_code);
                const isRateExcluded = excludedRates.has(project.project_code);

                // If rate is excluded, don't show the value at all
                if (isProjectExcluded || isRateExcluded) {
                  return <span className="text-gray-300">—</span>;
                }

                return <span>{formatCurrency(info.getValue())}</span>;
              },
              size: COLUMN_WIDTHS.projectColumn,
            }),
            columnHelper.accessor(
              (row) => {
                const key = `${row.code}-${project.project_code}`;
                return excludedRows.has(key);
              },
              {
                id: `${project.project_code}_excl`,
                header: 'Excl',
                cell: (info) => {
                  const rowData = info.row.original as ProcessedBenchmarkData;
                  const key = `${rowData.code}-${project.project_code}`;
                  const isProjectExcluded = excludedProjects.has(project.project_code);

                  return (
                    <input
                      type="checkbox"
                      checked={excludedRows.has(key) || isProjectExcluded}
                      onChange={() => handleExcludeChange(rowData.code, project.project_code)}
                      className="benchmark-table__checkbox"
                      disabled={isProjectExcluded}
                    />
                  );
                },
                size: 100, // Increased from 60 to 100 to prevent text truncation
              }
            ),
          ],
        })
      ),
      columnHelper.group({
        id: 'average',
        header: () => <span className="benchmark-table__project-text">Average</span>,
        meta: { frozen: 'right', isAverage: true },
        columns: [
          columnHelper.accessor('average.total', {
            id: 'average.total', // Explicit ID for pinning
            header: () => <span className="benchmark-table__project-text">Total</span>,
            cell: ({ getValue }) => {
              const value = getValue();
              return formatCurrency(value);
            },
            size: COLUMN_WIDTHS.averageTotal,
            meta: { frozen: 'right', isAverage: true }, // Add frozen property
            enablePinning: true, // Explicitly enable pinning
          }),
          columnHelper.accessor('average.ratePerXX', {
            id: 'average.ratePerXX', // Explicit ID for pinning
            header: () => (
              <div className="benchmark-table__rate-header">
                <span className="benchmark-table__project-text">Rate/m²</span>
              </div>
            ),
            cell: (info) => formatCurrency(info.getValue()),
            size: COLUMN_WIDTHS.averageRate,
            meta: { frozen: 'right', isAverage: true },
            enablePinning: true, // Explicitly enable pinning
          }),
        ],
      }),
    ],
    [
      columnHelper,
      selectedProjects,
      excludedRows,
      excludedProjects,
      excludedRates,
      handleExcludeChange,
      handleExcludeProject,
      handleExcludeRate,
    ]
  );

  return columns;
};
