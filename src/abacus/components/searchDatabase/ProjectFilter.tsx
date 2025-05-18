import React, { useState, useEffect, useRef } from 'react';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import Tag from '@/einstein/components/common/tag/Tag';
import './ProjectFilter.scss';

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export interface ProjectFilterProps {
  placeholder?: string;
  onSelect: (projectId: string) => void;
  onRemove: (projectId: string) => void;
  selectedProjects: string[];
  minSearchLength?: number;
  debounce?: number;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({
  placeholder = 'Search for Project ID...',
  onSelect,
  onRemove,
  selectedProjects,
  minSearchLength = 1,
  debounce = 300,
}) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchText = useDebounce(searchText, debounce);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchText(''); // This will close the dropdown since it depends on searchText
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions when search text changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchText.length < minSearchLength) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await abacusApiClient.get<string[]>(
          `/projects/projectInputData/${debouncedSearchText}`
        );
        // Filter out already selected projects from suggestions
        const filteredSuggestions = response.data.filter((id) => !selectedProjects.includes(id));
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error searching project IDs:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchText, minSearchLength, selectedProjects]);

  const handleProjectSelect = (projectId: string) => {
    setSearchText('');
    onSelect(projectId);
  };

  const handleRemoveProject = (projectId: string) => {
    onRemove(projectId);
  };

  return (
    <div className="project-filter" ref={dropdownRef}>
      <div className="project-filter__input-wrapper">
        <div className="project-filter__search-container">
          <img src="/icons/search.svg" alt="Search" className="project-filter__search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="project-filter__input"
          />
        </div>
        {selectedProjects.length > 0 && (
          <div className="project-filter__tags-container">
            {selectedProjects.map((projectId) => (
              <Tag
                key={projectId}
                label={projectId}
                onRemove={() => handleRemoveProject(projectId)}
              />
            ))}
          </div>
        )}
      </div>
      {debouncedSearchText.length >= minSearchLength && suggestions.length > 0 && (
        <ul className="project-filter__dropdown">
          {isLoading ? (
            <li className="project-filter__dropdown-item project-filter__dropdown-item--loading">
              Loading...
            </li>
          ) : (
            suggestions.map((projectId) => (
              <li
                key={projectId}
                onClick={() => handleProjectSelect(projectId)}
                className="project-filter__dropdown-item"
              >
                <div className="project-filter__dropdown-item-text">{projectId}</div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ProjectFilter;
