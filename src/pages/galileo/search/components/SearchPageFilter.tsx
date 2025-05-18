import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import apiClient from '@/lib/config/axiosConfig';
import { useSearchContext } from '../context/SearchContext';
import './SearchPageFilter.scss';

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

/**
 * Interface for project item data returned from the API
 */
export interface ProjectItem {
  projectid: string;
  projectname?: string;
  customername?: string;
  projectdirector?: string;
  [key: string]: string | undefined;
}

const SearchPageFilter: React.FC = () => {
  const { projectId, setProjectId, projectName, setProjectName } = useSearchContext();
  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearchText = useDebounce<string>(searchText, 300);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Search function that queries the backend
  const searchProjects = async (searchText: string): Promise<ProjectItem[]> => {
    if (!searchText || searchText.length < 2) return [];

    try {
      const response = await apiClient.get<ProjectItem[]>(
        `/projects/search?fieldName=projectid&queryTerm=${searchText}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  };

  // Use React Query to fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery<ProjectItem[]>({
    queryKey: ['project-search', 'projectid', debouncedSearchText],
    queryFn: () => searchProjects(debouncedSearchText),
    enabled: debouncedSearchText.length >= 2,
  });

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-page-filter')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectItem = (item: ProjectItem): void => {
    setProjectId(item.projectid);
    setProjectName(item.projectname || item.projectid);
    setSearchText('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="search-page-filter">
      <div className="search-page-filter__search-container">
        <Search className="search-page-filter__search-icon" />
        <input
          type="text"
          placeholder="Search by project ID"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="search-page-filter__input"
        />
      </div>

      {isDropdownOpen && debouncedSearchText.length >= 2 && suggestions.length > 0 && (
        <ul className="search-page-filter__dropdown">
          {isLoading ? (
            <li className="search-page-filter__dropdown-item search-page-filter__dropdown-item--loading">
              Loading...
            </li>
          ) : (
            suggestions.map((item) => (
              <li
                key={item.projectid}
                onClick={() => handleSelectItem(item)}
                className="search-page-filter__dropdown-item"
              >
                <div className="search-page-filter__dropdown-item-title">{item.projectid}</div>
                {item.projectname && (
                  <div className="search-page-filter__dropdown-item-subtitle">{item.projectname}</div>
                )}
                {item.customername && (
                  <div className="search-page-filter__dropdown-item-subtitle">
                    Client: {item.customername}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchPageFilter;
