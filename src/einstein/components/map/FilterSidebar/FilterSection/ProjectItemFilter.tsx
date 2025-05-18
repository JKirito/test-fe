/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/config/axiosConfig';
import { useFilterContext } from '@/einstein/components/map/FilterSidebar/context/FilterContext';
import Tag from '@/einstein/components/common/tag/Tag';
import './ProjectItemFilter.scss';

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export interface ProjectItemFilterProps<T> {
  fieldName: string;
  placeholder?: string;
  renderSuggestion?: (item: T) => React.ReactNode;
  getOptionKey?: (item: T) => string;
  minSearchLength?: number;
  debounce?: number;
  onSelect?: (item: T) => void;
  suggestionTitleKey?: string;
  suggestionSubtitleKey?: string;
}

function ProjectItemFilter<T>({
  fieldName,
  placeholder = `Search for ${fieldName}...`,
  renderSuggestion,
  getOptionKey,
  minSearchLength = 1,
  debounce = 300,
  onSelect,
  suggestionTitleKey,
  suggestionSubtitleKey,
}: ProjectItemFilterProps<T>) {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, debounce);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get filter context for tracking active selections
  const { activeFilters, setActiveFilters } = useFilterContext();
  // Ensure active selections for this field are treated as an array
  const activeSelections: string[] = activeFilters[fieldName] || [];

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

  // Internal search function that queries your backend using the fieldName parameter
  async function handleSearch(searchText: string): Promise<T[]> {
    const response = await apiClient.get(
      `/projects/search?fieldName=${encodeURIComponent(fieldName)}&queryTerm=${encodeURIComponent(searchText)}`
    );
    return response.data;
  }

  // Use React Query to fetch suggestions when the debounced search term meets the minimum length
  const { data: suggestions = [], isLoading } = useQuery<T[]>({
    queryKey: ['project-item-filter', fieldName, debouncedSearchText],
    queryFn: () => handleSearch(debouncedSearchText),
    enabled: debouncedSearchText.length >= minSearchLength,
  });

  return (
    <div className="project-item-filter" ref={dropdownRef}>
      <div className="project-item-filter__input-wrapper">
        <div className="project-item-filter__search-container">
          <img src="/icons/search.svg" alt="Search" className="project-item-filter__search-icon" />
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
              <Tag
                key={val}
                label={val}
                onRemove={() =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    [fieldName]: prev[fieldName]?.filter((item) => item !== val) || [],
                  }))
                }
              />
            ))}
          </div>
        )}
      </div>
      {debouncedSearchText.length >= minSearchLength && suggestions.length > 0 && (
        <ul className="project-item-filter__dropdown">
          {isLoading ? (
            <li className="project-item-filter__dropdown-item project-item-filter__dropdown-item--loading">
              Loading...
            </li>
          ) : (
            suggestions.map((item, index) => (
              <li
                key={getOptionKey ? getOptionKey(item) : index}
                onClick={() => {
                  const selectedValue =
                    suggestionTitleKey && (item as any)[suggestionTitleKey]
                      ? (item as any)[suggestionTitleKey]
                      : String(item);
                  if (!activeSelections.includes(selectedValue)) {
                    setActiveFilters((prev) => ({
                      ...prev,
                      [fieldName]: [...(prev[fieldName] || []), selectedValue],
                    }));
                  }
                  onSelect && onSelect(item);
                  setSearchText('');
                }}
                className="project-item-filter__dropdown-item"
              >
                {renderSuggestion ? (
                  renderSuggestion(item)
                ) : suggestionTitleKey ? (
                  <div>
                    <div className="project-item-filter__dropdown-item-title">
                      {(item as any)[suggestionTitleKey]}
                    </div>
                    {suggestionSubtitleKey && (item as any)[suggestionSubtitleKey] && (
                      <div className="project-item-filter__dropdown-item-subtitle">
                        {(item as any)[suggestionSubtitleKey]}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="project-item-filter__dropdown-item-text">{String(item)}</div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default ProjectItemFilter;
