import axios from 'axios';

/**
 * Custom Axios instance configured for the application.
 * All requests sent through 'api' will automatically have the base URL prepended.
 */
const api = axios.create({
  baseURL: '/api', // Proxied to localhost:5000 in dev via Vite config
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches the JWT token from localStorage to the Authorization header
 * of every outgoing request if the user is logged in.
 */
api.interceptors.request.use(
  (config) => {
    // Retrieve the user object from local storage
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      // Attach the Bearer token
      config.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Globally catches 401 Unauthorized errors from the backend.
 * If a token expires or is invalid, this automatically logs the user out and redirects them to login.
 */
api.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Catch 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - Logging out automatically.');
      localStorage.removeItem('userInfo');
      // Force a hard reload to clear React state and redirect to login via React Router fallback
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
