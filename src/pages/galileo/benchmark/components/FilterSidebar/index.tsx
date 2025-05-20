import React, { useState, useEffect } from 'react';
import { useBenchmarkFilters } from '../../context/BenchmarkFiltersContext';
import FilterList from './FilterList';
import './FilterSidebar.scss';

interface FilterSidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const FilterSidebarContent: React.FC = () => {
  const {
    activeFilters,
    clearFilters,
    applyFilters,
    isLoading,
    downloadFilteredData,
    isDownloading,
  } = useBenchmarkFilters();

  const handleResetFilters = () => {
    clearFilters();
  };

  const handleApplyFilters = async () => {
    await applyFilters();
  };

  const handleDownload = async () => {
    await downloadFilteredData();
  };

  return (
    <div className="filter-sidebar__content">
      <div className="filter-sidebar__scrollable-list">
        <FilterList />
      </div>
      <div className="filter-sidebar__footer">
        <div className="divider"></div>
        <button
          className="filter-sidebar__button filter-sidebar__button--download"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <img src="/icons/download.svg" alt="Download" />
              Downloading...
            </>
          ) : (
            <>
              <img src="/icons/download.svg" alt="Download" />
              Download Search Results
            </>
          )}
        </button>
        <div className="e-btn-group e-btn-group--equal">
          <button
            onClick={handleResetFilters}
            className="e-btn-reset"
            disabled={Object.keys(activeFilters).length === 0}
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className={`${Object.keys(activeFilters).length === 0 ? 'e-btn-base' : 'e-btn-apply'}`}
            disabled={isLoading || Object.keys(activeFilters).length === 0}
          >
            {isLoading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { activeFilters } = useBenchmarkFilters();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

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
