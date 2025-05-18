import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/config/axiosConfig';
import { useSearchContext } from '../context/SearchContext';
import { useSearchParams } from 'react-router-dom';
import './ProjectSearch.scss';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export const ProjectSearch = () => {
  const { projectId, setProjectId, projectName, setProjectName } = useSearchContext();
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 300);

  // Effect to fetch project details if projectId is in URL but no projectName
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (projectId && !projectName) {
        try {
          const response = await apiClient.get(
            `/projects/search?fieldName=projectid&queryTerm=${encodeURIComponent(projectId)}`
          );

          if (response.data && response.data.length > 0) {
            const project = response.data.find((p: any) => p.projectid === projectId);
            if (project) {
              setProjectName(project.projectname || project.projectid);
            }
          }
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      }
    };

    fetchProjectDetails();
  }, [projectId, projectName, setProjectName]);

  async function handleSearch(searchText: string) {
    const response = await apiClient.get(
      `/projects/search?fieldName=projectid&queryTerm=${encodeURIComponent(searchText)}`
    );
    return response.data;
  }

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['project-search', debouncedSearchText],
    queryFn: () => handleSearch(debouncedSearchText),
    enabled: debouncedSearchText.length >= 1,
  });

  return (
    <div className="project-search">
      <div className="project-search__container">
        <div className="project-search__input-wrapper">
          <Search className="project-search__icon" />
          <input
            type="text"
            placeholder="Search by project ID"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="project-search__input"
          />
        </div>
      </div>
      {isDropdownOpen && debouncedSearchText.length >= 1 && suggestions.length > 0 && (
        <ul className="project-search__dropdown">
          {isLoading ? (
            <li className="project-search__dropdown-item project-search__dropdown-item--loading">
              Loading...
            </li>
          ) : (
            suggestions.map((item: any) => (
              <li
                key={item.projectid}
                onClick={() => {
                  setProjectId(item.projectid);
                  setProjectName(item.projectname || item.projectid);
                  setSearchText('');
                  setIsDropdownOpen(false);
                }}
                className="project-search__dropdown-item"
              >
                <div className="project-search__dropdown-item-id">{item.projectid}</div>
                {item.projectname && (
                  <div className="project-search__dropdown-item-name">{item.projectname}</div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
