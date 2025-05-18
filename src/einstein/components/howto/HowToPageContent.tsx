import React, { useEffect, useMemo, useState } from 'react';
// Redux and Store Imports
import {
  fetchFilterOptions,
  fetchHowTos,
  setSelectedFilters,
  setSelectedHowTo,
  selectFilterOptions,
  selectSelectedFilters,
  selectHowTos,
  selectSelectedHowTo,
  selectIsLoading,
  selectHasAppliedFilters,
  selectFilterRelationships,
  SelectedFilters, // Import needed type
} from '@/lib/store/features/howto/howtoSlice';
import { useAppDispatch, useAppSelector } from '@/lib/store/store';

// Type Imports
import { HowToWithChildren } from '@/einstein/components/admin/howTo/types/howTo.types.ts';

// Utility Imports
import { sortHowTosRecursively } from '@/einstein/components/admin/howTo/utils';
import { findHowToById } from './utils/howtoUtils';

// Component Imports
import HowToHeader from './components/howToHeader/HowToHeader';
import HowToLayout from './components/layout/HowToLayout';
import HowToFilterWrapper from './components/filters/HowToFilterWrapper';
import HowToQuickLinks from './components/quicklinks/HowToQuickLinks';
import HowToContentDisplay from './components/content/HowToContentDisplay';

import './howToPageContent.scss';

/**
 * Container component for the HowTo page.
 * Handles state fetching, processing, effects, and orchestrates child components.
 */
const HowToPageContent: React.FC = () => {
  const dispatch = useAppDispatch();

  // --- State Selection ---
  const filterOptions = useAppSelector(selectFilterOptions);
  const filterRelationships = useAppSelector(selectFilterRelationships);
  const selectedFilters = useAppSelector(selectSelectedFilters);
  const howTos = useAppSelector(selectHowTos); // HowToWithChildren[]
  const selectedHowTo = useAppSelector(selectSelectedHowTo); // HowToWithChildren | null
  const isLoading = useAppSelector(selectIsLoading);
  const hasAppliedFilters = useAppSelector(selectHasAppliedFilters);

  // --- Memoized Calculations ---
  const sortedHowTos = useMemo(() => sortHowTosRecursively(howTos), [howTos]);

  const missingFilters = useMemo(() => {
    const missing = [];
    if (!selectedFilters.sector) missing.push('Sector');
    if (selectedFilters.sector && !selectedFilters.subsector) {
      const sectorRelationship = filterRelationships[selectedFilters.sector];
      const hasSubsectors =
        sectorRelationship &&
        Object.values(filterRelationships).some(
          (rel) => rel.parentId === selectedFilters.sector && rel.filterType === 'subsector'
        );
      if (hasSubsectors) {
        missing.push('Subsector');
      }
    }
    if (!selectedFilters.buildType) missing.push('How To Build');
    // Lifecycle check removed
    return missing;
  }, [selectedFilters, filterRelationships]);

  const hasPartialFilters = useMemo(() => {
    return (
      Object.values(selectedFilters).some((value) => value && value !== '') && !hasAppliedFilters
    );
  }, [selectedFilters, hasAppliedFilters]);

  // URL parameter handling

  // Helper function to validate filter chain (memoized to avoid dependency cycle)
  const validateFilterChain = useMemo(() => {
    return (sector: string, subsector?: string, buildType?: string) => {
      if (!filterOptions) return false;

      // Find the sector
      const sectorObj = filterOptions.sectors.find((s) => s._id === sector);
      if (!sectorObj) return false;

      // If subsector is provided, validate it belongs to the sector
      if (subsector) {
        const subsectorObj = filterOptions.subsectors.find((s) => s._id === subsector);
        if (!subsectorObj || subsectorObj.parentId !== sector) return false;

        // If buildType is provided, validate it belongs to the subsector
        if (buildType) {
          const buildTypeObj = filterOptions.buildTypes.find((b) => b._id === buildType);
          return !!(buildTypeObj && buildTypeObj.parentId === subsector);
        }
      } else if (buildType) {
        // If only sector and buildType are provided, validate buildType belongs to sector
        const buildTypeObj = filterOptions.buildTypes.find((b) => b._id === buildType);
        if (!buildTypeObj) return false;

        // Check if buildType's parent is a direct child of sector
        const parentSubsector = filterOptions.subsectors.find(
          (s) => s._id === buildTypeObj.parentId
        );
        return !!(parentSubsector && parentSubsector.parentId === sector);
      }

      return true; // If only sector is provided or validation passed
    };
  }, [filterOptions]);

  // Load filters from URL parameters after filter options are loaded
  useEffect(() => {
    // Only proceed if filter options are loaded
    if (!filterOptions) {
      return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sectorParam = urlParams.get('sector');
    const subsectorParam = urlParams.get('subsector');
    const buildTypeParam = urlParams.get('buildType');

    // Check if we have URL parameters
    if (sectorParam || subsectorParam || buildTypeParam) {
      // Create a filters object from URL parameters
      const filtersFromURL: SelectedFilters = {};

      // Validate the filter chain
      if (
        sectorParam &&
        validateFilterChain(sectorParam, subsectorParam ?? undefined, buildTypeParam ?? undefined)
      ) {
        filtersFromURL.sector = sectorParam;

        if (subsectorParam) {
          filtersFromURL.subsector = subsectorParam;
        }

        if (buildTypeParam) {
          filtersFromURL.buildType = buildTypeParam;
        }

        // Only apply filters if we have at least sector and buildType
        if (filtersFromURL.sector && filtersFromURL.buildType) {
          // console.log('Applying filters from URL:', filtersFromURL);
          dispatch(setSelectedFilters(filtersFromURL));
        }
      } else {
        console.warn('Invalid filter chain in URL parameters');
      }
    }
  }, [filterOptions, dispatch]); // Run when filter options are loaded

  // Track if filters are being loaded from URL
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(true);

  // Update isLoadingFromUrl when filter options are loaded
  useEffect(() => {
    if (filterOptions) {
      // Set a small delay to ensure URL parameters are processed first
      const timer = setTimeout(() => {
        setIsLoadingFromUrl(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [filterOptions]);

  // Update URL parameters when filters change
  useEffect(() => {
    // Don't update URL while loading filters from URL
    if (isLoadingFromUrl) {
      return;
    }

    // Create URL parameters from selected filters
    const newParams = new URLSearchParams();

    if (selectedFilters.sector) {
      newParams.set('sector', selectedFilters.sector);
    }

    if (selectedFilters.subsector) {
      newParams.set('subsector', selectedFilters.subsector);
    }

    if (selectedFilters.buildType) {
      newParams.set('buildType', selectedFilters.buildType);
    }

    // Update URL without adding to browser history
    const newUrl = newParams.toString()
      ? `${window.location.pathname}?${newParams.toString()}`
      : window.location.pathname;

    window.history.replaceState(null, '', newUrl);

    // Log the URL update for debugging
    // console.log('Updated URL with filters:', newUrl);
  }, [selectedFilters, isLoadingFromUrl]);

  // --- Effects ---
  // Load filter options on component mount
  useEffect(() => {
    // console.log('Fetching filter options...');
    dispatch(fetchFilterOptions())
      .unwrap()
      .then(() => {
        // console.log('Filter options loaded successfully');
      })
      .catch((error) => {
        console.error('Failed to load filter options:', error);
      });

    // Reset filters when component unmounts
    return () => {
      dispatch(setSelectedFilters({}));
    };
  }, [dispatch]);

  useEffect(() => {
    if (hasAppliedFilters) {
      dispatch(fetchHowTos(selectedFilters));
    }
  }, [dispatch, selectedFilters, hasAppliedFilters]);

  useEffect(() => {
    if (hasAppliedFilters && sortedHowTos.length > 0 && !selectedHowTo) {
      dispatch(setSelectedHowTo(sortedHowTos[0]));
    } else if ((!hasAppliedFilters || sortedHowTos.length === 0) && selectedHowTo) {
      dispatch(setSelectedHowTo(null));
    }
  }, [dispatch, sortedHowTos, selectedHowTo, hasAppliedFilters]);

  // --- Handlers ---
  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters: SelectedFilters = {
      ...selectedFilters,
      [filterType]: value,
    };
    if (filterType === 'sector') {
      newFilters.subsector = undefined;
    }
    dispatch(setSelectedFilters(newFilters));
  };

  const handleSelectHowTo = (howTo: HowToWithChildren | null) => {
    dispatch(setSelectedHowTo(howTo));
  };

  const handleQuickLinkClick = (event: React.MouseEvent, id: string) => {
    event.preventDefault();
    const targetHowTo = findHowToById(howTos, id); // Search in the original unsorted list? Or sorted? Should be same result.
    if (targetHowTo) {
      handleSelectHowTo(targetHowTo);
      // Scrolling logic remains if needed
      const contentElement = document.querySelector('.howto-layout__content'); // Updated selector
      if (contentElement) {
        contentElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      console.warn(`Quick link clicked, but HowTo item with id ${id} not found.`);
    }
  };

  // --- Main Render ---
  return (
    // Use a general page wrapper class if applicable from your design system
    <div className="how-to-page-content">
      <HowToHeader />

      <HowToLayout
        filtersSlot={
          <HowToFilterWrapper
            filterOptions={filterOptions}
            filterRelationships={filterRelationships}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />
        }
        quickLinksSlot={
          // Conditionally render QuickLinks based on filter status and data existence
          hasAppliedFilters && sortedHowTos.length > 0 ? (
            <>
              <div className="divider"></div>
              <HowToQuickLinks
                // Pass hierarchical data
                nodes={sortedHowTos}
                // Pass ID for the overview link
                overviewNodeId={sortedHowTos[0]?._id ?? null}
                // Pass the selected HowTo ID for active state styling
                selectedHowToId={selectedHowTo?._id ?? null}
                onLinkClick={handleQuickLinkClick}
              />
            </>
          ) : null
        }
        contentSlot={
          <HowToContentDisplay
            isLoading={isLoading}
            hasAppliedFilters={hasAppliedFilters}
            hasPartialFilters={hasPartialFilters}
            missingFilters={missingFilters}
            howTosCount={sortedHowTos.length} // Pass count only
            selectedHowTo={selectedHowTo}
          />
        }
      />
    </div>
  );
};

export default HowToPageContent;
