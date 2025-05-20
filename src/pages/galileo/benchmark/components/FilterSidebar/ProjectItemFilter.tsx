import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useBenchmarkFilters } from '../../context/BenchmarkFiltersContext';
import { ActiveFilters } from '../../filters';
import apiClient from '@/lib/config/axiosConfig';
import Tag from '@/einstein/components/common/tag/Tag';
import './ProjectItemFilter.scss';

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
  id: string;
  projectname: string;
  customername: string;
  projectdirector: string;
  [key: string]: string;
}

/**
 * Props for the ProjectItemFilter component
 */
export interface ProjectItemFilterProps {
  /** Field name to search and store selected values */
  fieldName: string;
  /** Key in ProjectItem to use as the main title in suggestions */
  suggestionTitleKey: keyof ProjectItem;
  /** Key in ProjectItem to use as the subtitle in suggestions */
  suggestionSubtitleKey: keyof ProjectItem;
  /** Placeholder text for the search input */
  placeholder: string;
}

const ProjectItemFilter: React.FC<ProjectItemFilterProps> = ({
  fieldName,
  suggestionTitleKey,
  suggestionSubtitleKey,
  placeholder,
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearchText = useDebounce<string>(searchText, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeFilters, setActiveFilters } = useBenchmarkFilters();

  // For customer and project name searches, we'll store the values in their respective fields
  // Use type assertion to handle the dynamic field name
  const activeSelections: string[] =
    (activeFilters[fieldName as keyof ActiveFilters] as string[]) || [];

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

  // Search function that queries the backend
  const searchProjects = async (searchText: string): Promise<ProjectItem[]> => {
    if (!searchText || searchText.length < 2) return [];

    try {
      const response = await apiClient.get<ProjectItem[]>(
        `/projects/search?fieldName=${fieldName}&queryTerm=${searchText}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  };

  // Use React Query to fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery<ProjectItem[]>({
    queryKey: ['project-search', fieldName, debouncedSearchText],
    queryFn: () => searchProjects(debouncedSearchText),
    enabled: debouncedSearchText.length >= 2,
  });

  const handleRemoveTag = (val: string): void => {
    // Create a new object with the same properties as activeFilters
    const newFilters: ActiveFilters = { ...activeFilters };

    // Get the current array for this field or an empty array if it doesn't exist
    const currentValues = (newFilters[fieldName as keyof ActiveFilters] as string[]) || [];

    // Filter out the value to remove
    const updatedValues = currentValues.filter((item: string) => item !== val);

    // Update the field with the filtered array
    newFilters[fieldName as keyof ActiveFilters] = updatedValues as any;

    // Set the new filters
    setActiveFilters(newFilters);
  };

  const handleSelectItem = (item: ProjectItem): void => {
    const selectedValue = item[suggestionTitleKey];
    if (!activeSelections.includes(selectedValue)) {
      // Create a new object with the same properties as activeFilters
      const newFilters: ActiveFilters = { ...activeFilters };

      // Get the current array for this field or an empty array if it doesn't exist
      const currentValues = (newFilters[fieldName as keyof ActiveFilters] as string[]) || [];

      // Add the new value to the array
      newFilters[fieldName as keyof ActiveFilters] = [...currentValues, selectedValue] as any;

      // Set the new filters
      setActiveFilters(newFilters);
    }
    setSearchText('');
  };

  return (
    <div className="project-item-filter" ref={dropdownRef}>
      <div className="project-item-filter__search-container">
        <Search className="project-item-filter__search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="project-item-filter__input"
        />
      </div>

      {activeSelections.length > 0 && (
        <div className="project-item-filter__tags-container">
          {activeSelections.map((val) => (
            <Tag key={val} label={val} onRemove={() => handleRemoveTag(val)} />
          ))}
        </div>
      )}

      {debouncedSearchText.length >= 2 && suggestions.length > 0 && (
        <ul className="project-item-filter__dropdown">
          {isLoading ? (
            <li className="project-item-filter__dropdown-item project-item-filter__dropdown-item--loading">
              Loading...
            </li>
          ) : (
            suggestions.map((item, index) => (
              <li
                key={`${item.id || index}-${item[suggestionTitleKey]}`}
                onClick={() => handleSelectItem(item)}
                className="project-item-filter__dropdown-item"
              >
                <div>
                  <div className="project-item-filter__dropdown-item-title">
                    {item[suggestionTitleKey]}
                  </div>
                  {item[suggestionSubtitleKey] && (
                    <div className="project-item-filter__dropdown-item-subtitle">
                      {item[suggestionSubtitleKey]}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ProjectItemFilter;
