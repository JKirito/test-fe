import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import './SearchMarker.scss';

interface SearchMarkerProps {
  position: {
    lat: number;
    lng: number;
  };
}

const SearchMarker: React.FC<SearchMarkerProps> = ({ position }) => {
  // Function to calculate offset for centering the div
  const getPixelPositionOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height / 2),
  });

  // Define the map pane name
  const OVERLAY_LAYER = 'overlayMouseTarget';

  return (
    <OverlayView
      position={position}
      mapPaneName={OVERLAY_LAYER}
      getPixelPositionOffset={getPixelPositionOffset}
    >
      <div className="search-marker" title="Search Location"></div>
    </OverlayView>
  );
};

export default SearchMarker;
