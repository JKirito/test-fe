import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SearchState {
  projectId: string;
  projectName: string;
}

const initialState: SearchState = {
  projectId: '',
  projectName: '',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setProjectId(state, action: PayloadAction<string>) {
      state.projectId = action.payload;
    },
    setProjectName(state, action: PayloadAction<string>) {
      state.projectName = action.payload;
    },
  },
});

export const { setProjectId, setProjectName } = searchSlice.actions;
export default searchSlice.reducer;
