// services/blogApi.js
import axios from 'axios'

// Configure axios base URL with proper fallback
const getAPIBaseURL = () => {
  // For production (deployed frontend)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://blog-backend-five-mu.vercel.app';
  }
  
  // For development (local frontend)
  return  'http://localhost:5000';
};

const API_BASE_URL = getAPIBaseURL();
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Blog API Functions
export const blogApi = {
  // Get all blogs with optional pagination and filters
  getAllBlogs: async (params = {}) => {
    try {
      const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = params

      const response = await api.get('/api/blogs', {
        params: { page, limit, category, search, sortBy, sortOrder }
      })
      console.log("Fetched Blogs:",response.data);
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch blogs' }
    }
  },

  // Get featured blogs
  getFeaturedBlogs: async () => {
    try {
      const response = await api.get('/api/blogs/featured')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch featured blogs' }
    }
  },

  // Get blog by ID
  getBlogById: async (id) => {
    try {
      const response = await api.get(`/api/blogs/admin/${id}`)
      console.log("Id  Blog:" ,response.data);
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch blog' }
    }
  },

  // Get blog by slug
  getBlogBySlug: async (slug) => {
    try {
      console.log("Fetchting by slug");
      const response = await api.get(`/api/blogs/${slug}`)
      console.log("Blog in api",response.data.data);
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch blog' }
    }
  },

  // Create new blog
  createBlog: async (blogData) => {
    try {
      const response = await api.post('/api/blogs', blogData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create blog' }
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/api/blogs/${id}`, blogData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update blog' }
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/api/blogs/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete blog' }
    }
  },

  // Get blogs by author
  getBlogsByAuthor: async (authorId, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params
      const response = await api.get(`/api/blogs/author/${authorId}`, {
        params: { page, limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch author blogs' }
    }
  },

  // Get blogs by category
  getBlogsByCategory: async (category, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params
      const response = await api.get(`/api/blogs/category/${category}`, {
        params: { page, limit }
      })
      console.log(response.data);
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch category blogs' }
    }
  },

  // Search blogs
  searchBlogs: async (query, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params
      const response = await api.get('/api/blogs/search', {
        params: { q: query, page, limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to search blogs' }
    }
  },

  // Toggle blog like
  toggleLike: async (blogId) => {
    try {
      const response = await api.post(`/api/blogs/${blogId}/like`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to toggle like' }
    }
  },

  // Add comment to blog
  addComment: async (blogId, commentData) => {
    try {
      const response = await api.post(`/api/blogs/${blogId}/comments`, commentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add comment' }
    }
  },

  // Get comments for a blog
  getComments: async (blogId, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params
      const response = await api.get(`/api/blogs/${blogId}/comments`, {
        params: { page, limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch comments' }
    }
  },

  // Update comment
  updateComment: async (blogId, commentId, commentData) => {
    try {
      const response = await api.put(`/api/blogs/${blogId}/comments/${commentId}`, commentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update comment' }
    }
  },

  // Delete comment
  deleteComment: async (blogId, commentId) => {
    try {
      const response = await api.delete(`/api/blogs/${blogId}/comments/${commentId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete comment' }
    }
  },

  // Upload image
  uploadImage: async (imageFile) => {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const response = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to upload image' }
    }
  },

  // Get blog analytics (for authors/admins)
  getBlogAnalytics: async (blogId) => {
    try {
      const response = await api.get(`/api/blogs/${blogId}/analytics`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch analytics' }
    }
  },

  // Get user's dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get('/api/dashboard')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch dashboard data' }
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/categories')
      console.log("Categories:",response.data);
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch categories' }
    }
  },

  // Get all tags
  getTags: async () => {
    try {
      const response = await api.get('/api/tags')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch tags' }
    }
  },

  // Get trending blogs
  getTrendingBlogs: async (params = {}) => {
    try {
      const { limit = 5, period = '7d' } = params
      const response = await api.get('/api/blogs/trending', {
        params: { limit, period }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch trending blogs' }
    }
  },

  // Get related blogs
  getRelatedBlogs: async (blogId, limit = 5) => {
    try {
      const response = await api.get(`/api/blogs/${blogId}/related`, {
        params: { limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch related blogs' }
    }
  },
  getAnalytics: async () => {
    try {
      const response = await axios.get('/api/analytics');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to fetch analytics' };
    }
  },

  getTrafficData: async () => {
    try {
      const response = await axios.get('/api/analytics/traffic');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to fetch traffic data' };
    }
  },

  getUsers: async () => {
    try {
      const response = await axios.get('/api/users');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to fetch users' };
    }
  },

  getSettings: async () => {
    try {
      const response = await axios.get('/api/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to fetch settings' };
    }
  },
  getRecentActivity: async () => {
    try {
      const response = await axios.get('/api/activities');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to fetch recent activities' };
    }
  },

   

   
} 
export default api