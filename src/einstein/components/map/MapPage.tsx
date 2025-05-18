import FilterSidebar from './FilterSidebar';
import MapComponent from './MapView/Map';
import { MapDataProvider } from './context/MapDataContext';
import { FilterProvider } from './FilterSidebar/context/FilterContext';
import './map.scss'; // Updated to SCSS import

export const MapPage = () => {
  return (
    <MapDataProvider>
      <FilterProvider>
        <div className="flex h-full map-container">
          <FilterSidebar />
          <div className="map-wrapper flex-grow">
            <MapComponent />
          </div>
        </div>
      </FilterProvider>
    </MapDataProvider>
  );
};

export default MapPage;
