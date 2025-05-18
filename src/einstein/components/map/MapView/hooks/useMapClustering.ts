import { useState, useEffect, useCallback, RefObject } from 'react';
import { PinData, Cluster } from '../types'; // Assuming PinData & Cluster are in MapView/types.ts

const DEFAULT_MAP_ZOOM = 12;
const CLUSTER_RADIUS = 0.005; // Base cluster radius

interface UseMapClusteringProps {
  filteredData: PinData[] | null;
  mapRef: RefObject<google.maps.Map | null>;
  zoomLevel: number;
}

// Helper to calculate distance squared (avoid sqrt for comparison)
const distanceSq = (p1: PinData, p2: PinData): number => {
  return Math.pow(p1.latitude - p2.latitude, 2) + Math.pow(p1.longitude - p2.longitude, 2);
};

export const useMapClustering = ({
  filteredData,
  mapRef,
  zoomLevel,
}: UseMapClusteringProps): Cluster[] => {
  const [clusters, setClusters] = useState<Cluster[]>([]);

  // Use zoom level to determine cluster radius (extracted logic)
  const getClusterRadius = useCallback(() => {
    if (!mapRef.current) return CLUSTER_RADIUS;

    const zoom = mapRef.current.getZoom() || DEFAULT_MAP_ZOOM;
    // Adjust cluster radius based on zoom level - more aggressive reduction at high zoom
    switch (true) {
      case zoom <= 10:
        return 0.01; // Wider clusters at very low zoom
      case zoom <= 12:
        return 0.005; // Medium clusters at medium zoom
      case zoom <= 14:
        return 0.0015; // Smaller clusters at higher zoom
      case zoom <= 16:
        return 0.0005; // Very small clusters at high zoom
      default:
        return 0.0001; // Almost no clustering at maximum zoom
    }
  }, [mapRef]); // Dependency on mapRef

  // Create clusters from filtered data when it changes or zoom changes (extracted logic)
  useEffect(() => {
    // Ensure mapRef.current is accessed inside useEffect/useCallback where it's stable
    const currentMap = mapRef.current;
    if (!filteredData || !Array.isArray(filteredData) || !currentMap) {
      setClusters([]); // Clear clusters if no data or map
      return;
    }

    // Get current zoom directly from the stable map instance
    const currentZoom = currentMap.getZoom() || DEFAULT_MAP_ZOOM;
    // console.log('(Hook) Clustering at zoom level:', currentZoom);

    // Prepare pins: Ensure lat/lng exist and handle potential location format
    const pins: PinData[] = filteredData
      .filter(
        (item) =>
          (item.latitude !== undefined && item.longitude !== undefined) ||
          item.location?.coordinates?.length === 2
      )
      .map((item) => {
        if (item.location?.coordinates) {
          // Ensure lat/lng are present even if converting from location
          return {
            ...item,
            latitude: item.latitude ?? item.location.coordinates[1],
            longitude: item.longitude ?? item.location.coordinates[0],
          };
        }
        return item;
      });

    // --- High Zoom: No Clustering ---
    if (currentZoom >= 17) {
      // console.log('(Hook) High zoom level, disabling clustering');
      const individualClusters: Cluster[] = pins.map((pin) => ({
        center: { lat: pin.latitude, lng: pin.longitude },
        pins: [pin],
        industry: pin.industry,
      }));
      setClusters(individualClusters);
      return;
    }

    // --- Refined Clustering Logic ---
    const clusterRadius = getClusterRadius();
    const clusterRadiusSq = clusterRadius * clusterRadius; // Compare squared distances
    // console.log('(Hook) Using cluster radius:', clusterRadius);

    const newClusters: Cluster[] = [];
    const processedPinIds = new Set<string>();

    for (let i = 0; i < pins.length; i++) {
      const currentPin = pins[i];

      // Skip if already processed
      if (processedPinIds.has(currentPin.projectId)) {
        continue;
      }

      // Find unprocessed neighbors
      const neighbors: PinData[] = [];
      for (let j = 0; j < pins.length; j++) {
        if (i === j) continue; // Don't compare pin to itself
        const potentialNeighbor = pins[j];

        if (!processedPinIds.has(potentialNeighbor.projectId)) {
          if (distanceSq(currentPin, potentialNeighbor) < clusterRadiusSq) {
            neighbors.push(potentialNeighbor);
          }
        }
      }

      // If no unprocessed neighbors, it's a single-pin cluster
      if (neighbors.length === 0) {
        newClusters.push({
          center: { lat: currentPin.latitude, lng: currentPin.longitude },
          pins: [currentPin],
          industry: currentPin.industry,
        });
        processedPinIds.add(currentPin.projectId);
      }
      // If neighbors found, create a cluster with currentPin and neighbors
      else {
        const clusterPins = [currentPin, ...neighbors];

        // Mark all pins in this new cluster as processed
        clusterPins.forEach((p) => processedPinIds.add(p.projectId));

        // Calculate center
        const sumLat = clusterPins.reduce((sum, p) => sum + p.latitude, 0);
        const sumLng = clusterPins.reduce((sum, p) => sum + p.longitude, 0);
        const center = {
          lat: sumLat / clusterPins.length,
          lng: sumLng / clusterPins.length,
        };

        // Determine dominant industry (same logic as before)
        const industryCount = new Map<string, number>();
        clusterPins.forEach((p) => {
          const industry = p.industry || 'default';
          industryCount.set(industry, (industryCount.get(industry) || 0) + 1);
        });
        let mostCommonIndustry = 'default';
        let maxCount = 0;
        industryCount.forEach((count, industry) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommonIndustry = industry;
          }
        });

        // Add the new cluster
        newClusters.push({
          center,
          pins: clusterPins,
          industry: mostCommonIndustry,
        });
      }
    }

    // console.log(`(Hook) Created ${newClusters.length} clusters/single pins`);
    setClusters(newClusters);
    // Dependencies: filteredData, zoomLevel (indirectly via getClusterRadius), and mapRef.current availability
  }, [filteredData, getClusterRadius, mapRef, zoomLevel]); // Include zoomLevel as direct dependency

  return clusters;
};
