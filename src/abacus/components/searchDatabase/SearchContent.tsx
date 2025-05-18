import React, { useState } from 'react';
import SearchDataTable from './searchDataTable';
import SearchHeader from './SearchHeader';
import ProjectFilter from './ProjectFilter';
import TableSkeleton from './TableSkeleton';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import { IBenchmarkProject } from '../benchmark/types';
import { toast } from 'react-hot-toast';
import styles from './SearchContent.module.scss';

interface ProjectData {
  projectId: string;
  data: IBenchmarkProject[];
}

const SearchContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectsData, setProjectsData] = useState<ProjectData[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Combine all project data for the table
  const allResults = projectsData.flatMap((project) => project.data);

  const handleProjectSelect = async (selectedProjectId: string) => {
    // Skip if already selected
    if (selectedProjects.includes(selectedProjectId)) {
      return;
    }

    setIsLoading(true);
    setSelectedProjects((prev) => [...prev, selectedProjectId]);

    try {
      const response = await abacusApiClient.post<{ results: IBenchmarkProject[] }>(
        '/projects/filtered',
        {
          projectCode: selectedProjectId,
        }
      );

      // Add new project data to the state
      setProjectsData((prev) => [
        ...prev,
        {
          projectId: selectedProjectId,
          data: response.data.results,
        },
      ]);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to fetch project details');
      // Remove the project from selected projects if fetch fails
      setSelectedProjects((prev) => prev.filter((id) => id !== selectedProjectId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectRemove = (projectId: string) => {
    // Remove from selected projects
    setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
    // Remove from projects data
    setProjectsData((prev) => prev.filter((project) => project.projectId !== projectId));
  };

  return (
    <div className={styles.abacusSearchContent}>
      <div className={styles.container}>
        <SearchHeader />
        <main className={styles.main}>
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>Project ID*</h2>
            <ProjectFilter
              placeholder="Search for Project ID..."
              onSelect={handleProjectSelect}
              onRemove={handleProjectRemove}
              selectedProjects={selectedProjects}
              minSearchLength={1}
              debounce={300}
            />
          </div>

          <div className={styles.resultsSection}>
            {/* Always show the results title if we have results or are loading */}
            {(allResults.length > 0 || isLoading) && (
              <div className={styles.resultsSectionTitle}>
                <span>Project Results</span>
                {!isLoading && (
                  <span className={styles.resultsSectionCount}>
                    {allResults.length} {allResults.length === 1 ? 'result' : 'results'}
                  </span>
                )}
              </div>
            )}

            {/* Show skeleton loader when loading, otherwise show the table */}
            {isLoading ? <TableSkeleton /> : <SearchDataTable data={allResults} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchContent;
