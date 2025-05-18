import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils/tailwind';
import { Search } from 'lucide-react';

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export interface SearchFilterProps<T> {
  placeholder?: string;
  onSearch: (searchText: string) => Promise<T[]>;
  onSelect: (item: T) => void;
  // Optional Tailwind classes for styling the input and dropdown
  inputClassName?: string;
  dropdownClassName?: string;
  // Optionally render a suggestion item
  renderSuggestion?: (item: T) => React.ReactNode;
  // Optionally extract a unique key from the item
  getOptionKey?: (item: T) => string;
  // The minimum number of characters before starting a search
  minSearchLength?: number;
  // Debounce delay in milliseconds
  debounce?: number;
}

function SearchFilter<T>({
  placeholder = 'Search...',
  onSearch,
  onSelect,
  inputClassName = '',
  dropdownClassName = 'absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded shadow',
  renderSuggestion,
  getOptionKey,
  minSearchLength = 1,
  debounce = 300,
}: SearchFilterProps<T>) {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, debounce);

  // Only query when the debounced term meets the min length
  const { data: suggestions = [], isLoading } = useQuery<T[]>({
    queryKey: ['search', debouncedSearchText],
    queryFn: () => onSearch(debouncedSearchText),
    enabled: debouncedSearchText.length >= minSearchLength,
    // You may add additional options such as staleTime, cacheTime etc.
  });

  const handleSearch = () => {
    if (searchText.length >= minSearchLength) {
      onSearch(searchText);
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={cn(
            'w-full p-4 pr-10 pl-6 rounded-full bg-primaryBlue/20 focus:outline-none focus:ring-2 focus:ring-primaryBlue/50',
            inputClassName
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          className="absolute right-0 text-white hover:text-white bg-darkGreen rounded-full p-4"
          aria-label="Search"
        >
          <Search className="h-10 w-10" />
        </button>
      </div>
      {debouncedSearchText.length >= minSearchLength && suggestions.length > 0 && (
        <ul className={dropdownClassName}>
          {isLoading ? (
            <li className="px-4 py-2 text-gray-500">Loading...</li>
          ) : (
            suggestions.map((item, index) => (
              <li
                key={getOptionKey ? getOptionKey(item) : index}
                onClick={() => {
                  onSelect(item);
                  setSearchText('');
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {renderSuggestion ? renderSuggestion(item) : String(item)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchFilter;
