/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMapDataContext } from '../../context/MapDataContext';
import { getGroupColor } from '../../utils/colors';
import { PinData } from '../types';
import { capitalizeFirstLetter } from '@/utils/utilities';

import './MapLegend.scss'; // Import SCSS file

const MapLegend = () => {
  const { filteredData } = useMapDataContext();

  // Get unique industry values and their colors
  const industryColors = new Map<string, string>();

  // Filter items with valid coordinates first
  const validLocations = filteredData?.filter(
    (item: PinData) =>
      (item.latitude !== undefined && item.longitude !== undefined) ||
      (item.location && item.location.coordinates && item.location.coordinates.length === 2)
  );

  validLocations?.forEach((item: any) => {
    const industry = item.industry || 'default';
    if (!industryColors.has(industry)) {
      industryColors.set(industry, getGroupColor(industry));
    }
  });

  if (industryColors.size === 0) return null;

  return (
    // Use BEM block class
    <div className="map-legend">
      {/* Use BEM element class */}
      <h3 className="map-legend__title">Sector</h3>
      {/* Use BEM element class */}
      <div className="map-legend__list">
        {Array.from(industryColors).map(([industry, color]) => (
          // Use BEM element class
          <div key={industry} className="map-legend__item">
            {/* Use BEM element class */}
            <div className="map-legend__colorSwatch" style={{ backgroundColor: color }} />
            {/* Use BEM element class */}
            <span className="map-legend__label">{capitalizeFirstLetter(industry)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
