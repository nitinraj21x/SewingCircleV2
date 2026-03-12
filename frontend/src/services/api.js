import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

// Debug logging - will be visible in browser console
console.log('Environment check:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  mode: import.meta.env.MODE
});

// Helper function to get full image URL
export const getImageUrl = (path) => {
  if (!path) return '';
  // If it's already a full URL (Cloudinary or other CDN), return as is
  if (path.startsWith('http')) return path;
  // For local paths, construct full URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Token refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and automatic refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/admin/refresh-token`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const eventsAPI = {
  // Get all events
  getAllEvents: () => api.get('/events'),
  
  // Get upcoming events
  getUpcomingEvents: () => api.get('/events/upcoming'),
  
  // Get past events
  getPastEvents: () => api.get('/events/past'),
  
  // Get single event
  getEvent: (id) => api.get(`/events/${id}`),
  
  // Register for event
  registerForEvent: (eventId) => api.post(`/events/${eventId}/register`, {}),
  
  // Unregister from event
  unregisterFromEvent: (eventId) => api.delete(`/events/${eventId}/register`),
};

export const authAPI = {
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
};

export const profileAPI = {
  // Get user profile
  getProfile: (userId) => api.get(`/profile/${userId}`),
  
  // Update skills
  updateSkills: (skills) => api.put('/profile/skills', { skills }),
  
  // Experience
  addExperience: (data) => api.post('/profile/experience', data),
  updateExperience: (id, data) => api.put(`/profile/experience/${id}`, data),
  deleteExperience: (id) => api.delete(`/profile/experience/${id}`),
  
  // Education
  addEducation: (data) => api.post('/profile/education', data),
  updateEducation: (id, data) => api.put(`/profile/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/profile/education/${id}`),
};

export const uploadAPI = {
  // Upload cover photo
  uploadCoverPhoto: (formData) => api.post('/upload/cover-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Upload profile picture
  uploadProfilePicture: (formData) => api.post('/upload/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const postsAPI = {
  // Get feed
  getFeed: (page = 1, limit = 10) => api.get(`/posts/feed?page=${page}&limit=${limit}`),
  
  // Create post
  createPost: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Like post
  likePost: (postId) => api.post(`/posts/${postId}/like`, {}),
  
  // Comment on post
  commentOnPost: (postId, content) => api.post(`/posts/${postId}/comment`, { content }),
  
  // Delete post
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

export const followAPI = {
  // Get follow suggestions
  getSuggestions: () => api.get('/follow/suggestions'),
  
  // Follow user
  followUser: (userId) => api.post(`/follow/${userId}`, {}),
};

export const adminAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    const { accessToken, refreshToken, admin } = response.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return { admin };
  },
  
  // Logout
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/admin/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  // Logout from all devices
  logoutAll: async () => {
    try {
      await api.post('/admin/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    }
    
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  // Verify token
  verifyToken: () => api.get('/admin/verify'),
  
  // Refresh token manually (if needed)
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/admin/refresh-token', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return { accessToken, refreshToken: newRefreshToken };
  },
  
  // Create event
  createEvent: (eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (key === 'images' && eventData[key]) {
        Array.from(eventData[key]).forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append(key, eventData[key]);
      }
    });
    return api.post('/admin/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update event
  updateEvent: (id, eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (key === 'images' && eventData[key]) {
        Array.from(eventData[key]).forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append(key, eventData[key]);
      }
    });
    return api.put(`/admin/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete event
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  
  // User management
  getUserStats: () => api.get('/admin/users/stats/overview'),
  getPendingUsers: () => api.get('/admin/users/pending'),
  getUsers: (status = '') => api.get(`/admin/users${status ? `?status=${status}` : ''}`),
  getDetailedProfiles: () => api.get('/admin/users/profiles/detailed'),
  approveUser: (userId) => api.put(`/admin/users/${userId}/approve`, {}),
  rejectUser: (userId, reason) => api.put(`/admin/users/${userId}/reject`, { reason }),
  suspendUser: (userId, reason) => api.put(`/admin/users/${userId}/suspend`, { reason }),
  reactivateUser: (userId) => api.put(`/admin/users/${userId}/reactivate`, {}),
  getUserPosts: (userId) => api.get(`/admin/users/${userId}/posts`),
};

export default api;
