import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/config/axiosConfig';
import Loader from '@/einstein/components/common/Loader';
import FetchDataError from '@/einstein/components/common/errors/FetchDataError';

export interface Filters {
  industry: string[];
  city: string[];
  serviceOffering: string[];
  plannedRevenue: { value: string; label: string }[];
  status: string[];
  projectIds: string[];
}

interface ActiveFilters {
  industry?: string[];
  city?: string[];
  serviceOffering?: string[];
  plannedRevenue?: string[];
  status?: string[];
  projectIds?: string[];
  [key: string]: string[] | undefined;
}

interface FilterContextType {
  filters: Filters;
  activeFilters: ActiveFilters;
  setActiveFilters: React.Dispatch<React.SetStateAction<ActiveFilters>>;
}

export const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<Filters>({
    industry: [],
    city: [],
    serviceOffering: [],
    plannedRevenue: [],
    status: [],
    projectIds: [],
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  const fetchFilters = async (): Promise<Filters> => {
    try {
      // console.log('Fetching filters from API...');
      const response = await apiClient.get('/map/filters');
      // console.log('API response:', response);

      // Ensure the response has the expected structure
      const data = response.data;
      if (!data) {
        console.error('API response data is empty');
        return {
          industry: [],
          city: [],
          serviceOffering: [],
          plannedRevenue: [],
          status: [],
          projectIds: [],
        };
      }

      // Log each filter array
      // console.log('industry:', data.industry);
      // console.log('city:', data.city);
      // console.log('serviceOffering:', data.serviceOffering);
      // console.log('plannedRevenue:', data.plannedRevenue);
      // console.log('status:', data.status);
      // console.log('projectIds:', data.projectIds);

      return data;
    } catch (error) {
      console.error('Error fetching filters:', error);
      // Return empty arrays as fallback
      return {
        industry: [],
        city: [],
        serviceOffering: [],
        plannedRevenue: [],
        status: [],
        projectIds: [],
      };
    }
  };

  const { error, isLoading, data } = useQuery({
    queryKey: ['map/filters'],
    queryFn: fetchFilters,
    staleTime: 0, // Don't cache the data
    refetchOnMount: true, // Always refetch when the component mounts
    onSuccess: (data) => {
      // console.log('Filter data fetched successfully:', data);
      setFilters({
        industry: data.industry || [],
        city: data.city || [],
        serviceOffering: data.serviceOffering || [],
        plannedRevenue: data.plannedRevenue || [],
        status: data.status || [],
        projectIds: data.projectIds || [],
      });
    },
  });

  // Add a useEffect to update filters when data changes
  useEffect(() => {
    if (data) {
      // console.log('Data changed, updating filters:', data);
      setFilters({
        industry: data.industry || [],
        city: data.city || [],
        serviceOffering: data.serviceOffering || [],
        plannedRevenue: data.plannedRevenue || [],
        status: data.status || [],
        projectIds: data.projectIds || [],
      });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <FetchDataError />;
  }

  return (
    <FilterContext.Provider value={{ filters, activeFilters, setActiveFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};
