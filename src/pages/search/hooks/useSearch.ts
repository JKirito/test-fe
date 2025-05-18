import { useState } from 'react';
import apiClient from '@/lib/config/axiosConfig';
import { SearchResult } from '../types';
import { FilterState } from '../components/Filter/Filter';
// Import the new configuration and helper functions
import {
  getAllIndexNames,
  getIndexNamesByType,
  getIndexNamesByFilterIds,
} from '../config/searchSources';

// No longer need the hardcoded SEARCH_INDEXES constant here
// const SEARCH_INDEXES = [...] as const;

// Define the initial filter state
const initialFilterState: FilterState = {
  type: 'all',
};

// Custom hook for search functionality
export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [error, setError] = useState<null | { message: string; code?: string }>(null);
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);

  const handleSearch = async (
    query: string = searchQuery,
    page: number = 1,
    currentFilter: FilterState = filterState
  ) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);

    const from = (page - 1) * resultsPerPage;

    // Determine searchIndexes based on the filter using the config helpers
    let searchIndexes: string[] = [];

    switch (currentFilter.type) {
      case 'sharepoint':
        searchIndexes = getIndexNamesByType('sharepoint');
        break;
      case 'citrixAll':
        searchIndexes = getIndexNamesByType('citrix');
        break;
      case 'citrixSpecific':
        searchIndexes = getIndexNamesByFilterIds(currentFilter.specificDrives || []);
        break;
      case 'all':
      default:
        searchIndexes = getAllIndexNames();
        break;
    }

    // The check for empty indexes remains relevant
    if (searchIndexes.length === 0) {
      // This might happen if type is citrixSpecific but specificDrives is empty or maps to no known indexes
      console.warn('No search indexes determined based on the current filter.');
      setIsSearching(false);
      setSearchResults([]);
      setTotalResults(0);
      setError({
        message:
          currentFilter.type === 'citrixSpecific' && !currentFilter.specificDrives?.length
            ? 'Please select specific Citrix drive to filter.'
            : 'No valid search sources selected based on the filter.',
      });
      return;
    }

    try {
      const response = await apiClient.post('/search/search', {
        indexes: searchIndexes, // Use the calculated indexes
        query,
        field: 'content',
        size: resultsPerPage,
        from,
      });

      const results = response.data.results || response.data;

      console.log('results', results);
      setSearchResults(results);
      setTotalResults(response.data.total || results.length);
      setCurrentPage(page);
      setIsSearching(false);
      setIsSearchVisible(true);
      return response.data;
    } catch (error: any) {
      setIsSearching(false);
      let errorMessage = 'An unexpected error occurred.';
      let errorCode;

      if (error.response) {
        errorCode = error.response.status.toString();
        const responseData = error.response.data;

        if (responseData?.message && typeof responseData.message === 'string') {
          try {
            const nestedError = JSON.parse(responseData.message);
            if (nestedError.error?.reason) {
              errorMessage = `Search failed: ${nestedError.error.reason}`;
            } else if (nestedError.error?.root_cause?.[0]?.reason) {
              errorMessage = `Search failed: ${nestedError.error.root_cause[0].reason}`;
            } else {
              errorMessage = responseData.message;
            }
          } catch (parseError) {
            errorMessage = responseData.message || `Server responded with status ${errorCode}.`;
          }
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }

        if (errorMessage === 'An unexpected error occurred.') {
          switch (error.response.status) {
            case 400:
              errorMessage = 'Invalid search query or parameters. Please check your input.';
              break;
            case 401:
              errorMessage = 'Unauthorized. Please log in again.';
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this search.';
              break;
            case 404:
              errorMessage = 'Search endpoint not found.';
              break;
            case 429:
              errorMessage = 'Too many search requests. Please try again later.';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'A server error occurred during the search. Please try again later.';
              break;
            default:
              errorMessage =
                errorMessage !== 'An unexpected error occurred.'
                  ? errorMessage
                  : `Server error: ${errorCode}.`;
          }
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
        errorCode = 'NETWORK_ERROR';
      } else {
        errorMessage = error.message || 'Failed to set up search request.';
        errorCode = 'REQUEST_ERROR';
      }

      setSearchResults([]);
      setTotalResults(0);
      setIsSearchVisible(false);
      setError({ message: errorMessage, code: errorCode });
      console.error('Search error:', error.response || error.request || error);
      return Promise.reject({ message: errorMessage, code: errorCode });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchVisible(false);
    setCurrentPage(1);
    setError(null);
    setFilterState(initialFilterState);
  };

  const handleFilterChange = (newFilterState: FilterState) => {
    setFilterState(newFilterState);
    if (searchQuery) {
      handleSearch(searchQuery, 1, newFilterState);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isSearchVisible,
    setIsSearchVisible,
    handleSearch,
    clearSearch,
    error,
    clearError: () => setError(null),
    filterState,
    handleFilterChange,
    pagination: {
      currentPage,
      totalResults,
      resultsPerPage,
      setCurrentPage,
      setResultsPerPage,
      totalPages: Math.ceil(totalResults / resultsPerPage),
    },
  };
};
