import axios, { AxiosInstance } from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BACKEND_EINSTEIN_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const abacusApiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_ABACUS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for both clients
const addAuthInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      const token = apiClient.defaults.headers.common['Authorization'];
      if (token) {
        config.headers.Authorization = token;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(apiClient);
addAuthInterceptor(abacusApiClient);

// Add a response interceptor for both clients
const addResponseInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const isNetworkError = error.code === 'ERR_NETWORK';
      const isServerError = error.response && error.response.status === 500;
      const isOnServerDownPage = window.location.pathname === '/server-down';

      if ((isNetworkError || isServerError) && !isOnServerDownPage) {
        // console.log('Server is down');
        // window.location.href = '/server-down';
      }
      return Promise.reject(error);
    }
  );
};

addResponseInterceptor(apiClient);
addResponseInterceptor(abacusApiClient);

export default apiClient;
