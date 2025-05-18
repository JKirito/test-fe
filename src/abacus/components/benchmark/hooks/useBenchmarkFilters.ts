import { useBenchmark } from '../BenchmarkContext';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import { toast } from 'react-hot-toast';
import { IBenchmarkFilters, IBenchmarkResponse } from '../types';

export const useBenchmarkFilters = () => {
  const { state, dispatch } = useBenchmark();

  const setFilter = (field: keyof IBenchmarkFilters, value: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { field, value },
    });
  };

  const setSectorAnswer = (index: number, answer: string) => {
    dispatch({
      type: 'SET_SECTOR_ANSWER',
      payload: { index, answer },
    });
  };

  const setSubSectorAnswer = (index: number, answer: string) => {
    dispatch({
      type: 'SET_SUBSECTOR_ANSWER',
      payload: { index, answer },
    });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const generateResults = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Create a clean filter object with only the filled values
      const cleanFilters: Record<string, any> = {};

      // Only include filters that have values
      Object.entries(state.filters).forEach(([key, value]) => {
        // For string values, only include if they're not empty
        if (typeof value === 'string' && value.trim() !== '') {
          cleanFilters[key] = value;
        }
        // For arrays, only include if they have items with answers
        else if (Array.isArray(value)) {
          if (key === 'sectorSpecificAnswers' || key === 'subSectorSpecificAnswers') {
            const answeredQuestions = value.filter((q) => q.answer && q.answer.trim() !== '');
            if (answeredQuestions.length > 0) {
              cleanFilters[key] = answeredQuestions;
            }
          } else if (value.length > 0) {
            cleanFilters[key] = value;
          }
        }
        // For other non-empty values
        else if (value !== null && value !== undefined && value !== '') {
          cleanFilters[key] = value;
        }
      });

      // // console.log('Sending filters:', cleanFilters);

      // Make the API call with the clean filters
      const response = await abacusApiClient.post<IBenchmarkResponse>(
        '/projects/filtered',
        cleanFilters
      );

      // Update the benchmark data context with the results
      dispatch({ type: 'SET_RESULTS', payload: response.data.results });
      dispatch({ type: 'SET_STEP', payload: 'results' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate benchmark results' });
      toast.error('Failed to generate benchmark results. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const goToFilters = () => {
    dispatch({ type: 'SET_STEP', payload: 'filters' });
  };

  return {
    filters: state.filters,
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    setFilter,
    setSectorAnswer,
    setSubSectorAnswer,
    resetFilters,
    generateResults,
    goToFilters,
  };
};
