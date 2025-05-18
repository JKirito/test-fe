import React from 'react';
import { SearchResult } from '@/pages/search/types';
import SearchResultItem from '../SearchResultItem'; // Keep adjusted path
import { Loader, AlertCircle } from 'lucide-react';
import styles from './SearchResultsList.module.scss'; // Import component's own styles
// import parentStyles from '../../SearchResults/SearchResults.module.scss'; // No longer needed
import itemStyles from '../SearchResultItem/SearchResultItem.module.scss'; // Import item styles

interface SearchResultsListProps {
  results: SearchResult[];
  searchQuery: string;
  isSearching: boolean;
  totalResults?: number;
  error: { message: string; code?: string } | null;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  searchQuery,
  isSearching,
  totalResults,
  error,
}) => {
  if (isSearching) {
    return (
      <div className={`${styles.searchFeedback} ${styles.searchLoading}`}>
        {' '}
        {/* Use own styles */}
        {/* Assuming animate-spin is a global/utility class */}
        <Loader size={32} className="animate-spin" />
        <span>Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.searchFeedback} ${styles.searchError}`}>
        {' '}
        {/* Use own styles */}
        {/* Assuming text-red-500 is a global/utility class */}
        <AlertCircle size={32} className="text-red-500" />
        <span>{error.message || 'An error occurred during the search.'}</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`${styles.searchFeedback} ${styles.noResults}`}>
        {' '}
        {/* Use own styles */}
        <h2>No results found for "{searchQuery}"</h2>
        <p>Try different keywords or check your spelling.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.searchResultsList}>
        {' '}
        {/* Use own styles */}
        {results.map((result, index) => (
          <div
            key={result.id || index}
            // Use the item's own style class, imported as itemStyles
            className={itemStyles.searchResultItem}
            style={{
              // Animation delay applied here to the item wrapper
              animationDelay: `${100 + index * 80}ms`,
            }}
          >
            <SearchResultItem result={result} />
          </div>
        ))}
      </div>
      <div className={styles.searchResultsInfo}>
        {' '}
        {/* Use own styles */}
        {totalResults !== undefined && totalResults > 0 && <p>About {totalResults} results</p>}
      </div>
    </>
  );
};

export default SearchResultsList;
