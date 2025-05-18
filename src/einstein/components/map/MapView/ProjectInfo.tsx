// Server Component - Note: React.memo might not be necessary or behave as expected in true RSCs,
// but assuming this might run client-side or benefit from memoization in current setup.
import React, { memo } from 'react'; // Import memo
import type { PinData, ProjectDetails } from './types';

interface ProjectInfoProps {
  label: string;
  value: string | null | undefined;
  copyable?: boolean;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const formatCurrency = (value?: number | null, currency: string = 'AUD') => {
  if (value === undefined || value === null) return 'N/A';
  try {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${value} ${currency}`;
  }
};

const ProjectInfoItem = ({ label, value, copyable }: ProjectInfoProps) => (
  <div>
    <div className="flex items-center gap-2">
      <p className="text-sm font-medium text-titlePrimaryBlue">{label}</p>
      {copyable && (
        <button
          className="text-titlePrimaryBlue hover:text-darkBlue transition-colors"
          title={`Copy ${label}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        </button>
      )}
    </div>
    <p className="text-[14px] text-gray-950 p-2 mt-2 bg-lightGray rounded-lg">{value || 'N/A'}</p>
  </div>
);

interface ProjectInfoComponentProps {
  project: PinData;
  details?: ProjectDetails | null;
  isLoading?: boolean;
}

// Wrap the main exported component with React.memo
export const ProjectInfo: React.FC<ProjectInfoComponentProps> = memo(
  ({ project, details, isLoading }: ProjectInfoComponentProps) => {
    if (isLoading) {
      return <div className="text-gray-600 text-center py-4">Loading project details...</div>;
    }

    // console.log('Rendering ProjectInfo with details:', details);

    if (details) {
      // Display only the requested fields from project details
      return (
        <div className="grid grid-cols-2 gap-4">
          <ProjectInfoItem label="Project ID" value={details.projectId} copyable={true} />
          <ProjectInfoItem label="Project Director" value={details.projectDirector} />
          <ProjectInfoItem label="Sector/Sub-Sector" value={details.industry} />
          <ProjectInfoItem label="Active Date" value={formatDate(details.activeDate)} />
          <ProjectInfoItem label="Start Date" value={formatDate(details.startDate)} />
          <ProjectInfoItem label="End Date" value={formatDate(details.endDate)} />
          <ProjectInfoItem label="Service Offering" value={details.serviceOffering} />
          <ProjectInfoItem
            label="Estimated Project Value"
            value={formatCurrency(details.estimatedProjectValue, details.salesCurrency)}
          />
        </div>
      );
    }

    // Display limited info from map data (pin data)
    return (
      <div className="grid grid-cols-2 gap-4">
        <ProjectInfoItem label="Project ID" value={project.projectId} copyable={true} />
        <ProjectInfoItem label="Project Name" value={project.projectName || project.projectname} />
        {project.projectdirector && (
          <ProjectInfoItem label="Project Director" value={project.projectdirector} />
        )}
        {project.industry && <ProjectInfoItem label="Sector/Sub-Sector" value={project.industry} />}
        <ProjectInfoItem label="Coordinates" value={`${project.latitude}, ${project.longitude}`} />
      </div>
    );
  }
);
