import { useQuery } from '@tanstack/react-query';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import { useHomeData } from '../HomeContext';
import { IQuestion } from '../types';
import { useProjectData } from './useProjectData';

export const useQuestions = () => {
  const { state } = useHomeData();
  const { sectors } = useProjectData();
  const { sector, subSector, sectorSpecificQuestions, subSectorSpecificQuestions } = state.data;

  // Find the selected sector to get its code
  const selectedSector = sectors.find((s) => s.value === sector);

  const { data: sectorQuestions } = useQuery({
    queryKey: ['sectorQuestions', selectedSector?.sector_code],
    queryFn: async () => {
      if (!selectedSector?.sector_code) return [];
      // Use sector_code for questions API
      const response = await abacusApiClient.get<IQuestion[]>(
        `/projects/sector-specific-questions/${selectedSector.sector_code}`
      );
      return response.data.map((question) => {
        // Find existing answer for this question
        const existingQuestion = sectorSpecificQuestions.find(
          (q) => q.question === question.question
        );
        return {
          ...question,
          answer: existingQuestion?.answer || '',
        };
      });
    },
    enabled: !!selectedSector?.sector_code && state.currentStep === 'second',
  });

  const { data: subSectorQuestions } = useQuery({
    queryKey: ['subSectorQuestions', subSector],
    queryFn: async () => {
      if (!subSector) return [];
      const response = await abacusApiClient.get<IQuestion[]>(
        `/projects/sub-sector-specific-questions/${subSector}`
      );
      return response.data.map((question) => {
        // Find existing answer for this question
        const existingQuestion = subSectorSpecificQuestions.find(
          (q) => q.question === question.question
        );
        return {
          ...question,
          answer: existingQuestion?.answer || '',
        };
      });
    },
    enabled: !!subSector && state.currentStep === 'second',
  });

  return {
    sectorQuestions: sectorQuestions || [],
    subSectorQuestions: subSectorQuestions || [],
  };
};
