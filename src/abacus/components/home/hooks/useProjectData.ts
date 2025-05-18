import { useQuery, useMutation } from '@tanstack/react-query';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import { useHomeData } from '../HomeContext';

interface ProjectDetails {
  projectid: string;
  projectname: string;
}

interface Sector {
  sector: string;
  sector_code: string;
}

interface SectorOption {
  value: string;
  label: string;
  sector: string;
  sector_code: string;
}

interface Option {
  value: string;
  label: string;
}

export const useProjectData = () => {
  const { state, dispatch } = useHomeData();

  const { mutate: fetchProjectDetails } = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await abacusApiClient.get<ProjectDetails>(
        `/projects/project-details/${projectId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      dispatch({
        type: 'UPDATE_FIRST_STEP',
        payload: {
          projectId: data.projectid,
          projectName: data.projectname,
        },
      });
    },
    onError: (err) => {
      dispatch({
        type: 'SET_ERROR',
        payload: `Failed to fetch project details: ${err}`,
      });
    },
  });

  const { data: sectors } = useQuery<SectorOption[]>({
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
  });

  const selectedSector = sectors?.find((s) => s.value === state.data.sector);

  const { data: subSectors } = useQuery<Option[]>({
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
  });

  const { data: constructionCostSources } = useQuery<Option[]>({
    queryKey: ['constructionCostSources'],
    queryFn: async () => {
      const response = await abacusApiClient.get<string[]>('/projects/construction-cost-sources');
      return response.data.map((s) => ({
        value: s,
        label: s,
      }));
    },
  });

  const { data: levelOfEstimates } = useQuery<Option[]>({
    queryKey: ['levelOfEstimates'],
    queryFn: async () => {
      const response = await abacusApiClient.get<string[]>('/projects/level-of-estimate');
      return response.data.map((s) => ({
        value: s,
        label: s,
      }));
    },
  });

  const { data: procurementModels } = useQuery<Option[]>({
    queryKey: ['procurementModels'],
    queryFn: async () => {
      const response = await abacusApiClient.get<string[]>('/projects/procurement-models');
      return response.data.map((s) => ({
        value: s,
        label: s,
      }));
    },
  });

  const { data: landTypes } = useQuery<Option[]>({
    queryKey: ['landTypes'],
    queryFn: async () => {
      const response = await abacusApiClient.get<string[]>('/projects/land-types');
      return response.data.map((s) => ({
        value: s,
        label: s,
      }));
    },
  });

  return {
    fetchProjectDetails,
    sectors: sectors || [],
    subSectors: subSectors || [],
    constructionCostSources: constructionCostSources || [],
    levelOfEstimates: levelOfEstimates || [],
    procurementModels: procurementModels || [],
    landTypes: landTypes || [],
  };
};
