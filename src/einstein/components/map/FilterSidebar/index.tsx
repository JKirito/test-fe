import React, { useState } from 'react';
import { useFilterContext } from './context/FilterContext';
import { FilterList } from './FilterSection/FilterList';
import { useMapDataContext } from '../context/MapDataContext';
import './FilterSidebar.scss'; // Import SCSS file for side effects

const FilterSidebarContent: React.FC = () => {
  // Use the filter context to clear all (active) filters.
  const { setActiveFilters, activeFilters, filters } = useFilterContext();
  const { mapBounds, fetchMapData, downloadFilteredData, isDownloading } = useMapDataContext();

  // // console.log('FilterSidebarContent - filters:', filters);
  // // console.log('FilterSidebarContent - activeFilters:', activeFilters);

  const handleResetFilters = () => {
    setActiveFilters({});
  };

  const handleApplyFilters = () => {
    // // console.log('Applying filters:', activeFilters);
    // // console.log('Map bounds:', mapBounds);
    fetchMapData(activeFilters, mapBounds ?? undefined);
  };

  const handleDownloadSearchResults = () => {
    // // console.log('Downloading search results:', activeFilters);
    // // console.log('Map bounds:', mapBounds);
    downloadFilteredData(activeFilters, mapBounds ?? undefined);
  };

  return (
    // Use BEM class names directly
    <div className="filter-sidebar__content">
      <div className="filter-sidebar__scrollable-list">
        <FilterList />
      </div>
      <div className="filter-sidebar__footer">
        <button
          className="filter-sidebar__button filter-sidebar__button--download"
          onClick={handleDownloadSearchResults}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <div className="filter-sidebar__button-group">
              <img src="/icons/download.svg" alt="Download" />
              Downloading...
            </div>
          ) : (
            <>
              <img src="/icons/download.svg" alt="Download" />
              Download Search Results
            </>
          )}
        </button>
        <div className="filter-sidebar__button-group">
          <button
            onClick={handleResetFilters}
            className="filter-sidebar__button filter-sidebar__button--reset"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="filter-sidebar__button filter-sidebar__button--apply"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Get active filters from context
  const { activeFilters } = useFilterContext();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Check if there are any active filters
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const sidebarClassName =
    `filter-sidebar ${isCollapsed ? 'filter-sidebar--is-collapsed' : ''}`.trim();

  // Add conditional class for the notification dot
  const hamburgerClassName = `filter-sidebar__hamburger-menu ${
    hasActiveFilters ? 'filter-sidebar__hamburger-menu--has-filters' : ''
  }`.trim();

  return (
    <div className={sidebarClassName}>
      {/* Hamburger Icon container with conditional class */}
      <div className={hamburgerClassName} onClick={toggleCollapse}>
        <img src="/icons/menu.svg" alt="hamburger_menu" />
      </div>

      {/* Header (always rendered, visibility controlled by CSS) */}
      <div className="filter-sidebar__header">
        <h2 className="filter-sidebar__title">Filters</h2>
        <button onClick={toggleCollapse} className="filter-sidebar__toggle-button">
          <img
            src="/icons/close-circle.svg"
            alt="menu_close"
            className="filter-sidebar__menu-icon"
          />
        </button>
      </div>

      {/* Content (always rendered, visibility controlled by CSS) */}
      <FilterSidebarContent />
    </div>
  );
};

export default FilterSidebar;
