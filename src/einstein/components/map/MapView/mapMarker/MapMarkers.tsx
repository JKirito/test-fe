import React, { useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { Cluster } from '../types'; // Assuming Cluster/PinData are in MapView/types.ts
import { getGroupColor } from '../../utils/colors'; // Restore import
import './MapMarkers.scss';

// Constants for styling
const MARKER_BASE_SIZE_PIN = 20; // Base size for single pins (diameter in px)
const MARKER_BASE_SIZE_CLUSTER = 36; // Base size for clusters (diameter in px)
const MARKER_HOVER_SCALE_FACTOR = 1.2;

// Constants for dual-circle design
const OUTER_CIRCLE_SCALE = 1.2; // How much larger the outer circle is compared to the base size
const INNER_CIRCLE_SCALE = 0.8; // How much smaller the inner circle is compared to the base size

// Cluster label styling
const CLUSTER_LABEL_COLOR = 'black';

interface MapMarkersProps {
  clusters: Cluster[];
  zoomLevel: number; // Keep zoomLevel for potential future dynamic sizing
  onClusterClick: (e: google.maps.MapMouseEvent, cluster: Cluster) => void; // Reverted to original event type
}

// Define constants for map panes - using Google's constant
const OVERLAY_MOUSE_TARGET = 'overlayMouseTarget';

const MapMarkers: React.FC<MapMarkersProps> = ({ clusters, zoomLevel, onClusterClick }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Function to calculate offset for centering the div
  const getPixelPositionOffset = () => ({ x: 0, y: 0 });

  // Handle click with correct event signature
  const handleMarkerClick = (e: React.MouseEvent<HTMLDivElement>, cluster: Cluster) => {
    // Create a synthetic google.maps.MapMouseEvent-like object
    const syntheticEvent = {
      latLng: new google.maps.LatLng(cluster.center.lat, cluster.center.lng),
      stop: () => {},
      domEvent: e.nativeEvent,
    } as google.maps.MapMouseEvent;

    onClusterClick(syntheticEvent, cluster);
  };

  return (
    <>
      {clusters.map((cluster) => {
        const isCluster = cluster.pins.length > 1;
        const markerKey = isCluster
          ? `cluster-${cluster.center.lat}-${cluster.center.lng}-${cluster.pins.length}`
          : `pin-${cluster.pins[0].projectId}`;

        const industry =
          cluster.industry || (isCluster ? 'default' : cluster.pins[0]?.industry || 'default');
        const markerColor = getGroupColor(industry);
        const isHovered = hoveredKey === markerKey;

        // Define base size based on type
        const baseSize = isCluster ? MARKER_BASE_SIZE_CLUSTER : MARKER_BASE_SIZE_PIN;
        const size = isHovered ? baseSize * MARKER_HOVER_SCALE_FACTOR : baseSize;

        // Calculate dimensions for the concentric circles
        const outerCircleSize = size * OUTER_CIRCLE_SCALE;
        const innerCircleSize = size * INNER_CIRCLE_SCALE;

        // Container style - this just positions the marker at the right place
        const containerStyle: React.CSSProperties = {
          position: 'absolute',
          transform: 'translate(-50%, -50%)', // Center the marker
          width: `${outerCircleSize}px`, // Size based on the outer circle
          height: `${outerCircleSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          zIndex: isHovered ? 10 : 1,
        };

        // Outer circle style
        const outerCircleStyle: React.CSSProperties = {
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: markerColor,
          opacity: 1,
        };

        // Inner circle style
        const innerCircleStyle: React.CSSProperties = {
          position: 'absolute',
          width: `${innerCircleSize}px`,
          height: `${innerCircleSize}px`,
          borderRadius: '50%',
          backgroundColor: 'white', // Inner circle is white
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1,
          zIndex: 2,
        };

        const labelStyle: React.CSSProperties = {
          color: CLUSTER_LABEL_COLOR,
          fontWeight: '400',
          fontSize: '14px',
          fontFamily: 'Rubik',
          userSelect: 'none',
          zIndex: 3,
        };

        return (
          <OverlayView
            key={markerKey}
            position={cluster.center}
            mapPaneName={OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPixelPositionOffset}
          >
            {/* Container div - handles positioning and events */}
            <div
              style={containerStyle}
              onClick={(e) => handleMarkerClick(e, cluster)}
              onMouseOver={() => setHoveredKey(markerKey)}
              onMouseOut={() => setHoveredKey(null)}
              title={
                isCluster
                  ? `${cluster.pins.length} projects`
                  : cluster.pins[0].projectName ||
                    cluster.pins[0].projectname ||
                    `Project ${cluster.pins[0].projectId}`
              }
            >
              {/* Outer (back) circle */}
              <div style={outerCircleStyle}></div>

              {/* Inner (front) circle */}
              <div style={innerCircleStyle}>
                {/* Render label only for clusters */}
                {isCluster && <span style={labelStyle}>{cluster.pins.length}</span>}
              </div>
            </div>
          </OverlayView>
        );
      })}
    </>
  );
};

export default MapMarkers;
