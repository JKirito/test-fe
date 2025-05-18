import React from 'react';
import { IBenchmarkProject } from '../types';

export interface ProjectSelectionTableProps {
  projects: IBenchmarkProject[];
  selectedProjects: IBenchmarkProject[];
  onSelectionChange: (project: IBenchmarkProject, isSelected: boolean) => void;
}

const ProjectSelectionTable: React.FC<ProjectSelectionTableProps & { className?: string }> = ({
  projects,
  selectedProjects,
  onSelectionChange,
  className = '',
}) => {
  return (
    <div className={`project-selection__table-wrapper ${className}`}>
      <table className="project-selection__table">
        <thead className="project-selection__thead">
          <tr>
            <th className="project-selection__th project-selection__th--checkbox">
              {/* Optional: Select All Checkbox */}
            </th>
            <th className="project-selection__th">Project ID</th>
            <th className="project-selection__th">Project Name</th>
            <th className="project-selection__th project-selection__th--description">
              Description
            </th>
            <th className="project-selection__th project-selection__th--meta">Sub Sector</th>
            <th className="project-selection__th project-selection__th--meta">Source</th>
            <th className="project-selection__th project-selection__th--meta">Estimate Level</th>
            <th className="project-selection__th project-selection__th--number">
              Construction Cost
            </th>
            <th className="project-selection__th project-selection__th--number">Year</th>
            <th className="project-selection__th project-selection__th--area">FECA (m²)</th>
          </tr>
        </thead>
        <tbody className="project-selection__tbody">
          {projects.map((project) => (
            <tr key={project._id} className="project-selection__tr">
              <td className="project-selection__td project-selection__td--checkbox">
                <input
                  type="checkbox"
                  checked={selectedProjects.some((p) => p._id === project._id)}
                  onChange={(e) => onSelectionChange(project, e.target.checked)}
                  className="project-selection__checkbox"
                  aria-label={`Select project ${project.project_code}`}
                />
              </td>
              <td className="project-selection__td">{project.project_code}</td>
              <td className="project-selection__td">{project['Project Name']}</td>
              <td className="project-selection__td project-selection__td--description">
                {project['Brief Project Description']}
              </td>
              <td className="project-selection__td project-selection__td--meta">
                {project['Sub-Sector (Leave Blank if TBA)']}
              </td>
              <td className="project-selection__td project-selection__td--meta">
                {project['Source of Construction Cost']}
              </td>
              <td className="project-selection__td project-selection__td--meta">
                {project['Level of Estimate']}
              </td>
              <td className="project-selection__td project-selection__td--number">
                ${project['Construction Cost']?.toLocaleString()}
              </td>
              <td className="project-selection__td project-selection__td--number">
                {project['Year of Head Contract Execution (Leave Blank if not executed)']}
              </td>
              <td className="project-selection__td project-selection__td--number">
                {project['Fully Enclosed Covered Area (FECA)']?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectSelectionTable;
