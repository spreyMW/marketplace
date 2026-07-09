const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = {
  async request(method, endpoint, data = null, isFormData = false) {
    const url = `${API_URL}${endpoint}`;
    const options = {
      method,
    };

    // Only set Content-Type for JSON requests
    if (!isFormData) {
      options.headers = {
        'Content-Type': 'application/json',
      };
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      if (isFormData) {
        // For FormData, let the browser set the Content-Type header
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP Error: ${response.status}` };
        }
        throw new Error(errorData.message || errorData.error || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  },

  get(endpoint) {
    return this.request('GET', endpoint);
  },

  post(endpoint, data, isFormData = false) {
    return this.request('POST', endpoint, data, isFormData);
  },

  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  },

  patch(endpoint, data, isFormData = false) {
    return this.request('PATCH', endpoint, data, isFormData);
  },

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  },
};
