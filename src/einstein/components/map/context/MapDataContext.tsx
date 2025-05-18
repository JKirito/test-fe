/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/config/axiosConfig';
import { ProjectDetails } from '../MapView/types';

// Helper function to extract filename from Content-Disposition header
const getFilenameFromHeader = (header: string | null): string => {
  if (!header) return 'downloaded_data.xlsx'; // Default filename
  const contentDisposition = header.match(/filename\*?=UTF-8''(.+)|filename="(.+)"/i);
  if (contentDisposition && (contentDisposition[1] || contentDisposition[2])) {
    return decodeURIComponent(contentDisposition[1] || contentDisposition[2]);
  }
  return 'downloaded_data.xlsx'; // Fallback default
};

interface MapBounds {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
}

interface MapDataContextType {
  filteredData: any; // Adjust this type as needed.
  setFilteredData: React.Dispatch<React.SetStateAction<any>>;
  mapBounds: MapBounds | null;
  setMapBounds: React.Dispatch<React.SetStateAction<MapBounds | null>>;
  fetchMapData: (filters?: any, bounds?: MapBounds) => Promise<void>;
  fetchProjectDetails: (projectId: string) => Promise<ProjectDetails | null>;
  isLoading: boolean;
  downloadFilteredData: (filters?: any, bounds?: MapBounds) => Promise<void>;
  isDownloading: boolean;
}

const MapDataContext = createContext<MapDataContextType | undefined>(undefined);

export const MapDataProvider = ({ children }: { children: ReactNode }) => {
  const [filteredData, setFilteredData] = useState<any>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const fetchMapData = useCallback(async (filters?: any, bounds?: MapBounds) => {
    setIsLoading(true);
    try {
      const payload = {
        ...filters,
        ...(bounds && {
          swLng: bounds.swLng,
          swLat: bounds.swLat,
          neLng: bounds.neLng,
          neLat: bounds.neLat,
        }),
      };

      const response = await apiClient.post('/map/filtered', payload);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadFilteredData = useCallback(async (filters?: any, bounds?: MapBounds) => {
    setIsDownloading(true);
    try {
      const payload = {
        ...filters,
        ...(bounds && {
          swLng: bounds.swLng,
          swLat: bounds.swLat,
          neLng: bounds.neLng,
          neLat: bounds.neLat,
        }),
      };

      const response = await apiClient.post('/map/download', payload, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const filename = getFilenameFromHeader(response.headers['content-disposition']);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading map data:', error);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const fetchProjectDetails = useCallback(
    async (projectId: string): Promise<ProjectDetails | null> => {
      try {
        // // console.log(`Fetching project details for ID: ${projectId}`);
        const response = await apiClient.get(`/map/project/${projectId}`);
        // // console.log('Project details API response:', response);

        if (response.status === 200) {
          if (response.data) {
            // // console.log('Project details data:', response.data);

            if (typeof response.data === 'object') {
              const data = response.data;

              if (data.projectId || data.projectName) {
                return data as ProjectDetails;
              } else {
                console.error('Project details data missing required fields:', data);
              }
            } else {
              console.error('Project details data is not an object:', response.data);
            }
          } else {
            console.error('Project details response data is null or undefined');
          }
        } else {
          console.error('Project details response was not successful:', response.status);
        }
        return null;
      } catch (error) {
        console.error(`Error fetching project details for ${projectId}:`, error);
        return null;
      }
    },
    []
  );

  return (
    <MapDataContext.Provider
      value={{
        filteredData,
        setFilteredData,
        mapBounds,
        setMapBounds,
        fetchMapData,
        fetchProjectDetails,
        isLoading,
        downloadFilteredData,
        isDownloading,
      }}
    >
      {children}
    </MapDataContext.Provider>
  );
};

export const useMapDataContext = () => {
  const context = useContext(MapDataContext);
  if (!context) {
    throw new Error('useMapDataContext must be used within a MapDataProvider');
  }
  return context;
};
