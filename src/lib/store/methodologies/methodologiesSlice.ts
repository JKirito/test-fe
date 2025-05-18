import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { IMethodCard } from '@/pages/methods/methods.models';
import { MockMethodCards } from '@/pages/methods/methods.mock';
import apiClient from '@/lib/config/axiosConfig';

// Define API response type to match the actual structure
interface ApiMethodologyItem {
  _id: string;
  name: string;
  description?: string;
  nodeType: string;
  order: number;
  files?: Array<{
    fileId: string;
    originalFileName: string;
    docType: string;
    url?: string;
    _id: string;
  }>;
  experts?: any[];
  createdAt: string;
}

interface ApiResponse {
  data: ApiMethodologyItem[];
}

// Convert API response to our IMethodCard model
const mapApiResponseToMethodCards = (apiData: ApiMethodologyItem[]): IMethodCard[] => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error('Invalid API data received:', apiData);
    return [];
  }

  // Sort by order first
  const sortedData = [...apiData].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Map to our model format
  return sortedData.map((item) => ({
    id: item._id,
    title: item.name,
    description: item.description,
    nodeType: item.nodeType,
    // Map other properties as needed
    links: item.files?.length
      ? [
          {
            title: 'Documentation',
            children: item.files.map((file) => ({
              title: file.originalFileName,
              url: file.url || '',
            })),
          },
        ]
      : undefined,
    // Initialize empty children array which can be populated later
    children: [],
  }));
};

export interface MethodologiesState {
  methodologies: IMethodCard[];
  loading: boolean;
  error: string | null;
}

const initialState: MethodologiesState = {
  methodologies: [],
  loading: false,
  error: null,
};

// Async thunk for fetching methodologies
export const fetchMethodologies = createAsyncThunk(
  'methodologies/fetchMethodologies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse>('/methodologies/all');

      // The response has a data property containing the array of items
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Convert the API response to our model format
        return mapApiResponseToMethodCards(response.data.data);
      } else {
        console.error('Unexpected API response format:', response.data);
        return MockMethodCards;
      }
    } catch (error) {
      // If API fails, return mock data for development
      console.warn('API call failed, using mock data', error);
      return MockMethodCards;
      // Uncomment below to properly handle errors in production
      // return rejectWithValue('Failed to fetch methodologies');
    }
  }
);

const methodologiesSlice = createSlice({
  name: 'methodologies',
  initialState,
  reducers: {
    resetMethodologies: (state) => {
      state.methodologies = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMethodologies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMethodologies.fulfilled, (state, action: PayloadAction<IMethodCard[]>) => {
        state.methodologies = action.payload;
        state.loading = false;
      })
      .addCase(fetchMethodologies.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch methodologies';
      });
  },
});

export const { resetMethodologies } = methodologiesSlice.actions;
export default methodologiesSlice.reducer;
