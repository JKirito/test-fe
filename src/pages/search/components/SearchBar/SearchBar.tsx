import React from 'react';
import styles from './SearchBar.module.scss'; // Import component's own styles

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onSubmit }) => {
  return (
    <div className={styles.searchBarContainer}>
      <form onSubmit={onSubmit} className={styles.searchForm}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
          placeholder="Search Citrix and Sharepoint"
        />
        <button type="submit" className={styles.searchButton}>
          <img src="/icons/search.svg" alt="Search" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
