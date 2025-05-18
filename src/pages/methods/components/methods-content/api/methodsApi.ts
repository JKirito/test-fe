import apiClient from '@/lib/config/axiosConfig';
import { ApiResponse } from './types';

/**
 * Fetch top-level methodologies
 */
export const fetchTopLevelMethodologies = async (): Promise<ApiResponse> => {
  const response = await apiClient.get('/methodologies/');
  return response.data;
};

/**
 * Fetch child methodologies for a parent node
 * @param parentId Parent node ID
 */
export const fetchChildMethodologies = async (parentId: string): Promise<ApiResponse> => {
  const response = await apiClient.get(`/methodologies/?parentId=${parentId}`);
  return response.data;
};

/**
 * Fetch a specific methodology by ID
 * @param id Methodology ID
 */
export const fetchMethodologyById = async (id: string): Promise<ApiResponse> => {
  const response = await apiClient.get(`/methodologies/${id}`);
  return response.data;
};
