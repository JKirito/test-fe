import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMapDataContext } from '../../context/MapDataContext';
import './LocationSearch.scss';

// Declare global Google Maps types
declare global {
  interface Window {
    google: {
      maps: {
        Geocoder: new () => {
          geocode: (
            request: { address: string },
            callback: (
              results: Array<{
                formatted_address: string;
                geometry: {
                  location: {
                    lat: () => number;
                    lng: () => number;
                  };
                };
              }>,
              status: string
            ) => void
          ) => void;
        };
        GeocoderStatus: {
          OK: string;
        };
      };
    };
  }
}

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

interface LocationSearchProps {
  placeholder?: string;
  minSearchLength?: number;
  debounce?: number;
}

interface GeocodingResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder = 'Search by location',
  minSearchLength = 3,
  debounce = 300,
}) => {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, debounce);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get map context to update map center
  const { setFilteredData } = useMapDataContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to geocode a location string
  const geocodeLocation = async (locationText: string): Promise<GeocodingResult[]> => {
    if (!locationText || locationText.length < minSearchLength) return [];

    try {
      // Check if Google Maps API is loaded
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        return new Promise((resolve) => {
          geocoder.geocode({ address: locationText }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
              resolve(results as unknown as GeocodingResult[]);
            } else {
              console.log('Geocoding returned no results or error:', status);
              resolve([]);
            }
          });
        });
      } else {
        console.warn('Google Maps API not loaded');
        return [];
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      return [];
    }
  };

  // Use React Query to fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery<GeocodingResult[]>({
    queryKey: ['location-search', debouncedSearchText],
    queryFn: () => geocodeLocation(debouncedSearchText),
    enabled: debouncedSearchText.length >= minSearchLength,
  });

  // Function to handle selecting a location
  const handleSelectLocation = (location: GeocodingResult) => {
    try {
      // Get coordinates from the location result
      const lat = location.geometry.location.lat();
      const lng = location.geometry.location.lng();

      // Save the formatted address as the selected location
      setSelectedLocation(location.formatted_address);

      // Dispatch a custom event that the map component can listen for
      const event = new CustomEvent('locationSelected', {
        detail: { lat, lng },
      });
      document.dispatchEvent(event);
      console.log('Dispatched locationSelected event with coordinates:', { lat, lng });
    } catch (error) {
      console.error('Error setting map location:', error);
    }

    setSearchText('');
    setIsDropdownOpen(false);
  };

  // Function to clear the selected location
  const clearSelectedLocation = () => {
    setSelectedLocation(null);
    // Dispatch an event to clear the marker
    document.dispatchEvent(
      new CustomEvent('locationSelected', {
        detail: { clear: true },
      })
    );
  };

  return (
    <div className="location-search" ref={dropdownRef}>
      <div className="location-search__input-wrapper">
        <div className="location-search__search-container">
          <img src="/icons/search.svg" alt="Search" className="location-search__search-icon" />
          <input
            type="text"
            placeholder={selectedLocation ? selectedLocation : placeholder}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => {
              setIsDropdownOpen(true);
              if (selectedLocation) {
                setSelectedLocation(null);
              }
            }}
            className="location-search__input"
          />
          {selectedLocation && (
            <button
              className="location-search__clear-button"
              onClick={clearSelectedLocation}
              title="Clear location"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {isDropdownOpen &&
        debouncedSearchText.length >= minSearchLength &&
        suggestions.length > 0 && (
          <ul className="location-search__dropdown">
            {isLoading ? (
              <li className="location-search__dropdown-item location-search__dropdown-item--loading">
                Loading...
              </li>
            ) : (
              suggestions.map((location, index) => (
                <li
                  key={`location-${index}`}
                  onClick={() => handleSelectLocation(location)}
                  className="location-search__dropdown-item"
                >
                  <div className="location-search__dropdown-item-text">
                    {location.formatted_address}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
    </div>
  );
};

export default LocationSearch;
