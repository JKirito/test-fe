import React from 'react';
import { useBenchmark } from '../../store';
import { Project } from '../../types';

interface ProjectTableProps {
  projects: Project[];
  onSelectionChange: (project: Project, isSelected: boolean) => void;
}

const TableHeaderNamesMapConfig: Record<string, string> = {
  projectid: 'Project ID',
  gfa: 'GFA',
  customerName: 'Customer Name',
  projectName: 'Project Name',
  city: 'City',
  industry: 'Industry',
  serviceOffering: 'Service Offering',
};

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onSelectionChange }) => {
  const { isProjectSelected, resetSelection, deselectedProjectIds } = useBenchmark();
  // Get all unique column keys from the projects
  const columnKeys = React.useMemo(() => {
    const keys = new Set<string>();
    projects.forEach((project) => {
      Object.keys(project).forEach((key) => {
        // Skip internal properties except _id
        if (!key.startsWith('_') || key === '_id') {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [projects]);

  // Organize columns in a specific order
  const organizedColumns = React.useMemo(() => {
    // Priority columns that should appear first (does Nothing right now)
    const priorityColumns = [
      'project_code',
      'Project Name',
      'Brief Project Description',
      'Sub-Sector (Leave Blank if TBA)',
      'Source of Construction Cost',
      'Level of Estimate',
      'Construction Cost',
      'Year of Head Contract Execution (Leave Blank if not executed)',
      'Fully Enclosed Covered Area (FECA)',
      'Gross Floor Area (GFA)',
    ];

    // Filter out priority columns that exist in our data
    // const existingPriorityColumns = priorityColumns.filter((col) => columnKeys.includes(col));

    // Get remaining columns
    const remainingColumns = columnKeys.filter(
      (col) => !priorityColumns.includes(col) && col !== '_id' && col !== 'gfa'
    );
    // console.debug('priorityColumns', priorityColumns);
    // console.debug('remainingColumns', remainingColumns);
    // console.debug('last output', ['_id', ...remainingColumns]);

    // Combine priority columns with remaining columns
    return ['_id', ...remainingColumns];
  }, [columnKeys]);

  // Format cell value based on its type
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '-';

    if (typeof value === 'number') {
      // Check if it might be a currency value
      if (organizedColumns.some((col) => col.toLowerCase().includes('cost') && value > 1000)) {
        return `$${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  };

  // Debug: Log the first project to see its structure
  React.useEffect(() => {
    if (projects.length > 0) {
      // // console.log('Project structure:', projects[0]);
    }
  }, [projects]);

  return (
    <div className="project-selection__table-wrapper">
      <table className="project-selection__table">
        <thead className="project-selection__thead">
          <tr>
            <th className="project-selection__th project-selection__th--checkbox">
              <input
                type="checkbox"
                className="project-selection__checkbox"
                checked={projects.length > 0 && deselectedProjectIds.length === 0}
                ref={(el) => {
                  if (el) {
                    // Indeterminate state when some projects are deselected but not all
                    el.indeterminate =
                      deselectedProjectIds.length > 0 &&
                      deselectedProjectIds.length < projects.length;
                  }
                }}
                onChange={(e) => {
                  // Handle select all / deselect all
                  const isChecked = e.target.checked;
                  // console.log('Select all:', isChecked);

                  if (isChecked) {
                    // Select all projects (clear deselected list)
                    resetSelection();
                    // console.log('Selected all projects');
                  } else {
                    // Deselect all projects (add all to deselected list)
                    projects.forEach((project) => {
                      onSelectionChange(project, false);
                    });
                    // console.log('Deselected all projects');
                  }
                }}
                aria-label="Select all projects"
              />
            </th>
            {organizedColumns
              .filter((column) => column !== '_id')
              .map((column) => (
                <th
                  key={column}
                  className={`project-selection__th ${
                    column.toLowerCase().includes('cost') ||
                    column.toLowerCase().includes('area') ||
                    column.toLowerCase().includes('year')
                      ? 'project-selection__th--number'
                      : column.toLowerCase().includes('description')
                        ? 'project-selection__th--description'
                        : ''
                  }`}
                >
                  {TableHeaderNamesMapConfig[column] || column}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="project-selection__tbody">
          {projects.map((project) => (
            <tr key={project.projectid || project._id} className="project-selection__tr">
              <td className="project-selection__td project-selection__td--checkbox">
                <input
                  type="checkbox"
                  checked={isProjectSelected(project.projectid || project._id || '')}
                  onChange={(e) => {
                    // Use projectid or _id depending on what's available
                    // console.log('Checkbox change:', projectId, e.target.checked);
                    onSelectionChange(project, e.target.checked);
                  }}
                  className="project-selection__checkbox"
                  aria-label={`Select project ${project.project_code}`}
                />
              </td>
              {organizedColumns
                .filter((column) => column !== '_id')
                .map((column) => (
                  <td
                    key={`${project.projectid || project._id}-${column}`}
                    className={`project-selection__td ${
                      column.toLowerCase().includes('cost') ||
                      column.toLowerCase().includes('area') ||
                      column.toLowerCase().includes('year')
                        ? 'project-selection__td--number'
                        : column.toLowerCase().includes('description')
                          ? 'project-selection__td--description'
                          : ''
                    }`}
                  >
                    {formatCellValue(project[column])}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
