import React from 'react';
import './SearchHeader.scss';

const SearchHeader: React.FC = () => {
  return (
    <header className="abacus-search-header">
      <img
        src="/icons/satellite.svg"
        alt="Search Database Logo"
        className="abacus-search-header__logo"
      />
      <div className="abacus-search-header__content">
        <h1 className="abacus-search-header__title">Search Our Database</h1>
        <p className="abacus-search-header__subtitle">Select From The Options Below</p>
      </div>
    </header>
  );
};

export default SearchHeader;
