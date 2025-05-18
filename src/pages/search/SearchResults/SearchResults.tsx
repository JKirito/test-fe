import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import SearchBar from '../components/SearchBar';
import SearchResultsList from '../components/SearchResultsList';
import Pagination from '../components/Pagination';
import Filter from '../components/Filter/Filter';
import styles from './SearchResults.module.scss';

const SearchResults = () => {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearch,
    pagination,
    error,
    clearError,
    filterState, // Get filter state from hook
    handleFilterChange, // Get filter change handler from hook
  } = useSearch();

  const [localQuery, setLocalQuery] = useState('');

  // Effect to sync URL param with search state
  useEffect(() => {
    if (query) {
      const decodedQuery = decodeURIComponent(query);
      // Only update if the decoded query is different from the current state
      if (decodedQuery !== searchQuery) {
        setSearchQuery(decodedQuery);
        setLocalQuery(decodedQuery); // Sync local input too
      }
    } else {
      // Optional: Clear search if URL query param is removed
      // clearSearch(); // If clearSearch is exposed from useSearch
    }
    // Trigger search automatically only when the searchQuery state changes
    // This avoids double searching when navigating directly to /search/term
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, setSearchQuery]); // Dependency on query and setSearchQuery

  // Effect to trigger search when searchQuery or filterState changes
  useEffect(() => {
    // Check if searchQuery exists and is not empty
    if (searchQuery) {
      // We pass the filterState here
      handleSearch(searchQuery, 1, filterState);
    }
    // Ensure handleSearch dependency includes filterState if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterState]); // Trigger on query or filter change

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || !searchQuery) return;
    // Pass current filter state when changing pages
    handleSearch(searchQuery, newPage, filterState);
  };

  const handleLocalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      clearError();
      // Navigate to the new search URL. This will trigger the first useEffect
      // which updates searchQuery, which in turn triggers the second useEffect
      // to perform the search with the *current* filterState.
      navigate(`/search/${encodeURIComponent(localQuery)}`);
    }
  };

  return (
    <div className={styles.searchResultsPage}>
      {' '}
      {/* Use styles object */}
      <div className={styles.searchHeader}>
        {' '}
        {/* Use styles object */}
        <SearchBar query={localQuery} setQuery={setLocalQuery} onSubmit={handleLocalSearchSubmit} />
      </div>
      {/* Container for Filters and Results */}
      <div className={styles.contentArea}>
        {/* Filter Section */}
        <div className={styles.filterPanel}>
          <Filter initialFilter={filterState} onChange={handleFilterChange} />
        </div>

        {/* Results Section */}
        <div className={styles.resultsPanel}>
          <SearchResultsList
            results={searchResults}
            searchQuery={searchQuery}
            isSearching={isSearching}
            totalResults={pagination.totalResults}
            error={error}
          />
          {searchResults.length > 0 && !isSearching && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
