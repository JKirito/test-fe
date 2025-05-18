import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useMapDataContext } from '../context/MapDataContext';
import { ActivePinData, PinData, Cluster } from './types';
import MapLegend from './mapLegend/MapLegend';
import ActivePinOverlay from './activePinOverlay/ActivePinOverlay';
import { useFilterContext } from '../FilterSidebar/context/FilterContext';
import { snazzyMapStyle } from '../utils/mapStyles';
import { useMapClustering } from './hooks/useMapClustering';
import MapMarkers from './mapMarker/MapMarkers';
import ClusterOverlay from './clusterOverlay/ClusterOverlay';
import SearchMarker from './SearchMarker';

// Default coordinates (same as before, but in regular lat/lng format)
const DEFAULT_CENTER = {
  lat: -37.814,
  lng: 144.9633,
};

const DEFAULT_MAP_ZOOM = 12;

const MapComponent = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCm-Da44zXLVXtMIDsedThtjOJJTmN6yNc',
  });

  const { filteredData, setMapBounds, fetchMapData, isLoading } = useMapDataContext();
  const { activeFilters } = useFilterContext();
  const [selectedPins, setSelectedPins] = useState<ActivePinData[]>([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [clusterPosition, setClusterPosition] = useState<{ x: number; y: number } | null>(null);
  const [searchLocationMarker, setSearchLocationMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_MAP_ZOOM);

  // --- Clustering Hook ---
  const clusters = useMapClustering({ filteredData, mapRef, zoomLevel });

  // --- Map Event Handlers ---

  // Handler for when map is loaded
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Function to get and update map bounds
  const updateMapBounds = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const newBounds = {
      neLat: ne.lat(),
      neLng: ne.lng(),
      swLat: sw.lat(),
      swLng: sw.lng(),
    };
    setMapBounds(newBounds);
    return newBounds;
  }, [setMapBounds]);

  // Handler for when map bounds change (debounced data fetching)
  const onBoundsChanged = useCallback(() => {
    if (boundsChangeTimeoutRef.current) {
      clearTimeout(boundsChangeTimeoutRef.current);
    }
    boundsChangeTimeoutRef.current = setTimeout(() => {
      const newBounds = updateMapBounds();
      if (newBounds) {
        fetchMapData(activeFilters, newBounds);
      }
    }, 500); // 500ms debounce
  }, [updateMapBounds, fetchMapData, activeFilters]);

  // Handler for zoom changes
  const onZoomChanged = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || DEFAULT_MAP_ZOOM;
      if (currentZoom !== zoomLevel) {
        // console.log('(MapComp) Zoom changed from', zoomLevel, 'to', currentZoom);
        setZoomLevel(currentZoom);
      }
    }
  }, [zoomLevel]);

  // --- Effect for Initial Geolocation ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  // --- Effect for Debugging ---
  useEffect(() => {
    if (filteredData && Array.isArray(filteredData)) {
      // console.log('(MapComp) Filtered data received:', filteredData.length, 'items');
      if (filteredData.length > 0) {
        // console.log('(MapComp) Sample item:', filteredData[0]);
      }
    }
  }, [filteredData]);

  // --- Effect for Cleanup ---
  useEffect(() => {
    return () => {
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current);
      }
    };
  }, []);

  // --- Effect for Location Search Event Listener ---
  useEffect(() => {
    const handleLocationSelected = (event: CustomEvent) => {
      // Check if this is a clear event
      if (event.detail.clear) {
        // Clear the search location marker
        setSearchLocationMarker(null);
        return;
      }

      const { lat, lng } = event.detail;
      if (mapRef.current && lat && lng) {
        console.log('Map component received location coordinates:', { lat, lng });

        // Set the search location marker
        setSearchLocationMarker({ lat, lng });

        // Center the map on the selected location
        mapRef.current.setCenter({ lat, lng });
        mapRef.current.setZoom(14);
      }
    };

    // Add event listener for custom location selected event
    document.addEventListener('locationSelected', handleLocationSelected as EventListener);

    // Cleanup
    return () => {
      document.removeEventListener('locationSelected', handleLocationSelected as EventListener);
    };
  }, []);

  // --- Interaction Handlers ---

  const handleMarkerClick = useCallback((e: google.maps.MapMouseEvent, item: PinData) => {
    if (!e.domEvent) return;
    const mouseEvent = e.domEvent as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    if (!target) return;

    // console.log('(MapComp) Marker clicked, item:', item);

    const overlayPosition = {
      x: mouseEvent.clientX - 150, // Center the overlay horizontally
      y: mouseEvent.clientY - 200, // Position above the marker
    };

    setSelectedPins((prev) => {
      const existing = prev.find((p) => p.projectId === item.projectId);
      if (existing) {
        return prev.map((p) =>
          p.projectId === item.projectId ? { ...p, isHighlighted: true } : p
        );
      }
      return [
        ...prev,
        {
          ...item,
          initialPosition: overlayPosition,
          isHighlighted: true,
        } as ActivePinData,
      ];
    });
  }, []);

  const handleClusterClick = useCallback(
    (e: google.maps.MapMouseEvent, cluster: Cluster) => {
      if (!e.domEvent) return;
      const mouseEvent = e.domEvent as MouseEvent;

      if (cluster.pins.length === 1) {
        handleMarkerClick(e, cluster.pins[0]);
        return;
      }

      const clickX = mouseEvent.clientX;
      const clickY = mouseEvent.clientY;

      setClusterPosition({ x: clickX, y: clickY });
      setSelectedCluster(cluster);
    },
    [handleMarkerClick]
  );

  const handleClusterClose = useCallback(() => {
    setSelectedCluster(null);
    setClusterPosition(null);
  }, []);

  const handleSelectPinFromCluster = useCallback(
    (pin: PinData) => {
      if (!clusterPosition) return;
      const overlayPosition = { ...clusterPosition }; // Use cluster overlay's position

      setSelectedPins((prev) => {
        const existing = prev.find((p) => p.projectId === pin.projectId);
        if (existing) {
          return prev.map((p) =>
            p.projectId === pin.projectId ? { ...p, isHighlighted: true } : p
          );
        }
        return [
          ...prev,
          {
            ...pin,
            initialPosition: overlayPosition,
            isHighlighted: true,
          } as ActivePinData,
        ];
      });
      handleClusterClose(); // Close cluster overlay when pin is selected
    },
    [clusterPosition, handleClusterClose]
  );

  // --- NEW: Callbacks specific to ActivePinOverlay ---

  // Callback for closing ActivePinOverlay
  const handleActivePinClose = useCallback((pinToRemove: PinData) => {
    setSelectedPins((prev) => prev.filter((p) => p.projectId !== pinToRemove.projectId));
  }, []);

  // Callback for resetting highlight on ActivePinOverlay
  const handleActivePinHighlightReset = useCallback((pinToUpdate: PinData) => {
    setSelectedPins((prev) =>
      prev.map((p) => (p.projectId === pinToUpdate.projectId ? { ...p, isHighlighted: false } : p))
    );
  }, []);

  // --- Render Logic ---

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        mapContainerClassName="google-map"
        center={mapCenter}
        zoom={zoomLevel}
        onLoad={onMapLoad}
        onBoundsChanged={onBoundsChanged}
        onZoomChanged={onZoomChanged}
        options={{
          styles: snazzyMapStyle,
          gestureHandling: 'greedy', // Allow pan and zoom gestures
          disableDefaultUI: true,
          minZoom: 3, // Prevent zooming out too far (world view)
          maxZoom: 20, // Maximum zoom level
          restriction: {
            latLngBounds: {
              north: 85, // Maximum north latitude
              south: -85, // Maximum south latitude
              west: -180, // Maximum west longitude
              east: 180, // Maximum east longitude
            },
            strictBounds: true, // Prevents panning outside these bounds
          },
        }}
      >
        <MapMarkers clusters={clusters} zoomLevel={zoomLevel} onClusterClick={handleClusterClick} />

        {/* Search Location Marker */}
        {searchLocationMarker && <SearchMarker position={searchLocationMarker} />}
      </GoogleMap>

      {isLoading && (
        <div className="loading-overlay">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#E2E8F0" strokeWidth="4" />
            <path
              d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          Loading data...
        </div>
      )}

      <MapLegend />

      {selectedPins.map((pin) => (
        <ActivePinOverlay
          key={pin.projectId}
          selectedPin={pin}
          onClose={handleActivePinClose}
          onHighlightReset={handleActivePinHighlightReset}
        />
      ))}

      {selectedCluster && clusterPosition && (
        <ClusterOverlay
          cluster={selectedCluster}
          position={clusterPosition}
          onClose={handleClusterClose}
          onSelectPin={handleSelectPinFromCluster}
        />
      )}
    </>
  );
};

export default MapComponent;
