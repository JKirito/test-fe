import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { msalInstance } from '../../../config/authConfig';
import apiClient from '../../../config/axiosConfig';

export type Role = string;

export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[]; // Update roles to be an array of Role objects
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: null | User;
}

export const initializeAuth = createAsyncThunk('auth/initializeAuth', async () => {
  let account = msalInstance.getActiveAccount();

  if (!account) {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      account = accounts[0];
      msalInstance.setActiveAccount(account);
    }
  }

  if (account) {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['user.read', 'profile', 'openid', 'email'],
        account,
      });

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.accessToken}`;

      // Fetch user roles from the backend
      const rolesResponse = await apiClient.get<{ roles: Role[] }>('/users/roles');
      if (!rolesResponse.data) {
        throw new Error('No roles found');
      }
      const roles = rolesResponse.data.roles;

      return {
        account: account,
        token: tokenResponse,
        roles: roles, // Include roles in the returned payload
      };
    } catch (error) {
      console.error('Token acquisition or role fetching failed:', error);
      throw error;
    }
  } else {
    // console.log('No active account found.');
    throw new Error('No active account found.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    isLoading: true,
    user: null,
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.clear(); // Clear all local storage
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeAuth.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = {
        id: action.payload.account.localAccountId,
        email: action.payload.account.username,
        name: action.payload.account.name || '',
        roles: action.payload.roles, // Store roles in the state
      };
    });
    builder.addCase(initializeAuth.rejected, (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
