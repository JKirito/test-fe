import React from 'react';
import { SearchProvider } from '../context/SearchContext';
import SearchHeader from './SearchHeader';
import SearchPageFilter from './SearchPageFilter';
import ProjectChartView from './ProjectChartView';
import './SearchPage.scss';

const SearchPage: React.FC = () => {
  return (
    <SearchProvider>
      <div className="search-page">
        <SearchHeader />
        <div className="search-page__content">
          <div className="search-page__search-container">
            <SearchPageFilter />
          </div>
          <div className="search-page__charts-container">
            <ProjectChartView />
          </div>
        </div>
      </div>
    </SearchProvider>
  );
};

export default SearchPage;
