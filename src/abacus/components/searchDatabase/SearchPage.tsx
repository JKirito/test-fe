import React from 'react';
import SearchContent from './SearchContent';
import './SearchPage.scss';
import SearchFooter from './SearchFooter';

const SearchPage: React.FC = () => {
  return (
    <>
      <div className="abacus-search-page">
        <SearchContent />
      </div>
      <SearchFooter />
    </>
  );
};

export default SearchPage;
