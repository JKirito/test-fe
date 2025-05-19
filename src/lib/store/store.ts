import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import howtoReducer from './features/howto/howtoSlice';
import methodologiesReducer from './methodologies/methodologiesSlice';
import benchmarkReducer from './features/galileo/benchmarkSlice';
import searchReducer from './features/galileo/searchSlice';
import { useSelector, useDispatch } from 'react-redux';
import { TypedUseSelectorHook } from 'react-redux';

const store = configureStore({
  reducer: {
    auth: authReducer,
    howto: howtoReducer,
    methodologies: methodologiesReducer,
    benchmark: benchmarkReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/initializeAuth/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.account.tenantProfiles'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.tenantProfiles'],
      },
    }),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<AppStore['getState']>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
