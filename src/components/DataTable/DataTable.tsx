import React from 'react';
import './DataTable.scss';

// Use the same interface as in CombinedGanttChart
interface GanttChartData {
  _id: string;
  project_code: string;
  type: string;
  category_level: number;
  level_1_name: string;
  gantt_chart_legend: string;
  planned_start_date: string;
  planned_finish_date: string;
  actual_start_date: string;
  actual_finish_date: string;
  planned_duration: number;
  actual_duration: number;
}

interface DataTableProps {
  data: GanttChartData[] | null;
  loading: boolean;
  error: string | null;
}

export const DataTable: React.FC<DataTableProps> = ({ data, loading, error }) => {
  // Format date to local date string with more details
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate variance between actual and planned duration
  const calculateVariance = (planned: number, actual: number) => {
    const variance = actual - planned;
    const percentVariance = ((variance / planned) * 100).toFixed(1);
    return {
      value: variance,
      percent: percentVariance,
      isPositive: variance > 0
    };
  };

  // Calculate gap or overlap between planned and actual dates
  const calculateDateGapOrOverlap = (plannedEnd: string, actualStart: string) => {
    const plannedEndDate = new Date(plannedEnd).getTime();
    const actualStartDate = new Date(actualStart).getTime();
    const diffTime = actualStartDate - plannedEndDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      days: Math.abs(diffDays),
      isGap: diffDays > 0,
      isOverlap: diffDays < 0
    };
  };

  if (loading) {
    return (
      <div className="abacus-data-table__loading">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="abacus-data-table__error">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="abacus-data-table__empty">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Filter data to only include items with all required fields
  const validData = data.filter(d =>
    d.planned_start_date &&
    d.planned_finish_date &&
    d.actual_start_date &&
    d.actual_finish_date &&
    d.planned_duration !== undefined &&
    d.actual_duration !== undefined
  );

  if (validData.length === 0) {
    return (
      <div className="abacus-data-table__empty">
        <p className="text-gray-500">No complete data available</p>
      </div>
    );
  }

  return (
    <div className="abacus-data-table">
      <div className="abacus-data-table__container">
        <table className="abacus-data-table__table">
          <thead>
            <tr>
              <th className="text-left">Stage</th>
              <th className="text-right" style={{ minWidth: '100px' }}>Planned Start</th>
              <th className="text-right" style={{ minWidth: '100px' }}>Planned End</th>
              <th className="text-right">Planned Duration</th>
              <th className="text-right" style={{ minWidth: '100px' }}>Actual Start</th>
              <th className="text-right" style={{ minWidth: '100px' }}>Actual End</th>
              <th className="text-right">Actual Duration</th>
              <th className="text-right">Duration Variance</th>
              <th className="text-right">Gap/Overlap</th>
            </tr>
          </thead>
          <tbody>
            {validData.map((item) => {
              const variance = calculateVariance(item.planned_duration, item.actual_duration);
              const gapOrOverlap = calculateDateGapOrOverlap(item.planned_finish_date, item.actual_start_date);

              return (
                <tr key={item._id}>
                  <td className="text-left font-medium">{item.gantt_chart_legend}</td>
                  <td className="text-right">{formatDate(item.planned_start_date)}</td>
                  <td className="text-right">{formatDate(item.planned_finish_date)}</td>
                  <td className="text-right">{item.planned_duration} days</td>
                  <td className="text-right">{formatDate(item.actual_start_date)}</td>
                  <td className="text-right">{formatDate(item.actual_finish_date)}</td>
                  <td className="text-right">{item.actual_duration} days</td>
                  <td className={`text-right ${variance.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                    {variance.isPositive ? '+' : ''}{variance.value} days ({variance.isPositive ? '+' : ''}{variance.percent}%)
                  </td>
                  <td className={`text-right ${gapOrOverlap.isGap ? 'text-amber-500' : gapOrOverlap.isOverlap ? 'text-green-500' : ''}`}>
                    {gapOrOverlap.isGap ?
                      `${gapOrOverlap.days} days gap` :
                      gapOrOverlap.isOverlap ?
                      `${gapOrOverlap.days} days overlap` :
                      'None'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
