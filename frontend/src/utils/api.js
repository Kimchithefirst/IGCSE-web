/**
 * API utility for making requests to the backend
 */

// Base API URL - configurable based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 10000;

/**
 * Creates an AbortController with timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {AbortController} AbortController instance
 */
const createAbortController = (timeout) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
};

/**
 * Handles API responses and errors
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} Parsed response data
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();
  
  if (!response.ok) {
    const error = isJson && data.message ? data.message : 'An unexpected error occurred';
    throw new Error(error);
  }
  
  return data;
};

/**
 * API utility object with methods for HTTP requests
 */
export const api = {
  /**
   * Perform a GET request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, options = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const controller = createAbortController(timeout);
    
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...authHeaders,
          ...options.headers
        },
        signal: controller.signal,
        mode: 'cors' // Explicitly set CORS mode
        // Removed credentials: 'include' as it can cause CORS issues
      });
      
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  },
  
  /**
   * Perform a POST request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data, options = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const controller = createAbortController(timeout);
    
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authHeaders,
          ...options.headers
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        mode: 'cors'
      });
      
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  },
  
  /**
   * Perform a PUT request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data, options = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const controller = createAbortController(timeout);
    
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authHeaders,
          ...options.headers
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        mode: 'cors'
      });
      
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  },
  
  /**
   * Perform a DELETE request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint, options = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const controller = createAbortController(timeout);
    
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...authHeaders,
          ...options.headers
        },
        signal: controller.signal,
        mode: 'cors'
      });
      
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
};

// New dedicated function for fetching dashboard data
export const getDashboardData = async () => {
  // This will use the existing api.get method, which now includes auth
  return api.get('/api/dashboard');
};

// New function for fetching courses
export const getCourses = async () => {
  try {
    const response = await api.get('/api/courses');
    // Assuming the actual course data is nested under response.data.data
    // If the structure is different, this line will need adjustment.
    // For example, if it's directly response.data, use that.
    // Or if the backend nests it like { data: { courses: [] } }, then response.data.courses
    return response.data; // Adjusted based on typical API responses where data is the main object
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    throw error;
  }
};

/**
 * Check server health - Simplified version that matches the working direct fetch
 * 
 * @returns {Promise<Object>} Server status information
 */
export function checkHealth() {
  // Use the same simple approach as the working direct fetch
  return fetch(`${API_BASE_URL}/api/health`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors'
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  });
}

// Export all functions as the API object
const apiObject = {
  get: api.get,       // Methods from the 'api' const defined above
  post: api.post,
  put: api.put,
  delete: api.delete,
  checkHealth,         // Named export, defined above
  getDashboardData,    // Named export, defined above (moved earlier)
  getCourses           // Add getCourses to the exported object
};

export default apiObject;
// The duplicate getDashboardData function that was here has been removed.