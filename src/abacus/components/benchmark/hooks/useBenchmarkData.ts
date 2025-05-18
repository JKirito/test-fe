import { useQuery } from '@tanstack/react-query';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import { useBenchmark } from '../BenchmarkContext';
import { useMemo } from 'react';

interface Sector {
  sector: string;
  sector_code: string;
}

// Define a type for the options used in Select components
// Added disabled property for graying out options
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean; // Optional property to disable the option
  // Keep existing properties if needed, e.g., sector_code for sectors
  sector?: string;
  sector_code?: string;
}

// Interface for question structure
interface Question {
  id: string;
  question: string;
  answer: string; // Added answer field for state management
}

export const useBenchmarkData = () => {
  const { state, dispatch } = useBenchmark();
  const { filters } = state;

  const { data: sectors } = useQuery<SelectOption[]>({
    queryKey: ['sectors'],
    queryFn: async () => {
      const response = await abacusApiClient.get<Sector[]>('/projects/sectors');
      return response.data.map((s) => ({
        value: s.sector,
        label: s.sector,
        sector: s.sector,
        sector_code: s.sector_code,
      }));
    },
    // Keep fetched data fresh but don't refetch too often
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch available sectors
  const { data: availableSectorsData } = useQuery<string[]>({
    queryKey: ['availableSectors'],
    queryFn: async () => {
      // Assuming the endpoint returns an array of available sector values (strings)
      const response = await abacusApiClient.get<string[]>('/projects/sectors/available');
      return response.data;
    },
    // Keep fetched data fresh but don't refetch too often
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoize the set of available sectors for quick lookup
  const availableSectorsSet = useMemo(() => {
    return new Set(availableSectorsData || []);
  }, [availableSectorsData]);

  // Add the `disabled` property to sectors based on availability
  const sectorsWithAvailability = useMemo(() => {
    return (sectors || []).map((sector) => ({
      ...sector,
      disabled: !availableSectorsSet.has(sector.value),
    }));
  }, [sectors, availableSectorsSet]);

  const selectedSector = sectors?.find((s) => s.value === filters.sector);

  const { data: subSectors } = useQuery<SelectOption[]>({
    queryKey: ['subSectors', selectedSector?.sector],
    queryFn: async () => {
      if (!selectedSector?.sector) return [];
      const response = await abacusApiClient.get<string[]>(
        `/projects/sectors/${selectedSector.sector}/subsectors`
      );
      return response.data.map((s) => ({
        value: s,
        label: s,
      }));
    },
    enabled: !!selectedSector?.sector,
    staleTime: 5 * 60 * 1000,
  });

  const { data: constructionCostSources } = useQuery<SelectOption[]>({
    queryKey: ['constructionCostSources'],
    queryFn: async () => {
      const response = await abacusApiClient.get<string[]>('/projects/construction-cost-sources');
      return response.data.map((s) => ({
        value: s,
        label: s,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: classEstimates } = useQuery<SelectOption[]>({
    queryKey: ['classEstimates'],
    queryFn: async () => {
      const response = await abacusApiClient.get<string[]>('/projects/level-of-estimate');
      return response.data.map((s) => ({
        value: s,
        label: s,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: sectorQuestions } = useQuery<Question[]>({
    queryKey: ['sectorQuestions', selectedSector?.sector_code],
    queryFn: async () => {
      if (!selectedSector?.sector_code) return [];
      const response = await abacusApiClient.get<{ id: string; question: string }[]>(
        `/projects/sector-specific-questions/${selectedSector.sector_code}`
      );
      const questions = response.data.map((question) => ({
        ...question,
        answer: '', // Initialize answer field
      }));

      dispatch({
        type: 'SET_FILTER',
        payload: { field: 'sectorSpecificAnswers', value: questions },
      });

      return questions;
    },
    enabled: !!selectedSector?.sector_code,
    staleTime: 5 * 60 * 1000,
  });

  const { data: subSectorQuestions } = useQuery<Question[]>({
    queryKey: ['subSectorQuestions', filters.subSector],
    queryFn: async () => {
      if (!filters.subSector) return [];
      const response = await abacusApiClient.get<{ id: string; question: string }[]>(
        `/projects/sub-sector-specific-questions/${filters.subSector}`
      );
      const questions = response.data.map((question) => ({
        ...question,
        answer: '', // Initialize answer field
      }));

      dispatch({
        type: 'SET_FILTER',
        payload: { field: 'subSectorSpecificAnswers', value: questions },
      });

      return questions;
    },
    enabled: !!filters.subSector,
    staleTime: 5 * 60 * 1000,
  });

  return {
    sectors: sectorsWithAvailability || [], // Return sectors with availability info
    subSectors: subSectors || [],
    constructionCostSources: constructionCostSources || [],
    classEstimates: classEstimates || [],
    sectorQuestions: sectorQuestions || [],
    subSectorQuestions: subSectorQuestions || [],
    // Note: availableSectorsData is used internally but not directly returned
  };
};
