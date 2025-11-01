import axios, { AxiosResponse, AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for sending cookies with requests
});

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthenticated/unauthorized requests
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);