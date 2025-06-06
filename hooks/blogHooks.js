// hooks/useBlog.js
import { useState, useEffect, useCallback } from 'react'
import { blogApi } from '../app/services/blogApi'

// Hook for fetching blogs with pagination
export const useBlogs = (initialParams = {}) => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState(initialParams)

  const fetchBlogs = useCallback(async (newParams = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const finalParams = { ...params, ...newParams }
      const result = await blogApi.getAllBlogs(finalParams)
      
      if (result.success) {
        // Handle different API response structures
        const responseData = result.data
        setBlogs(responseData.data || responseData.blogs || responseData || [])
        
        // Handle pagination metadata
        const meta = responseData.meta || responseData.pagination || {}
        setTotalPages(meta.totalPages || meta.pages || 0)
        setCurrentPage(meta.page || meta.currentPage || 1)
        setTotal(meta.total || meta.count || responseData.length || 0)
      } else {
        setError(result.error || 'Failed to fetch blogs')
        setBlogs([])
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching blogs')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const refetch = useCallback((newParams = {}) => {
    setParams(prev => ({ ...prev, ...newParams }))
    fetchBlogs(newParams)
  }, [fetchBlogs])

  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !loading) {
      refetch({ page: currentPage + 1 })
    }
  }, [currentPage, totalPages, loading, refetch])

  return {
    blogs,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    refetch,
    loadMore,
    hasMore: currentPage < totalPages
  }
}

// Hook for fetching a single blog
export const useBlog = (_id, type = 'id') => {
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
 
  const fetchBlog = useCallback(async () => {
    if (!_id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = type === 'slug' 
        ? await blogApi.getBlogBySlug(_id)
        : await blogApi.getBlogById(_id)
      
      if (result.success) {
        console.log("result data in slug:",result?.data);
        setBlog(result.data)
      } else {
        setError(result.error || 'Failed to fetch blog')
        setBlog(null)
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the blog')
      setBlog(null)
    } finally {
      setLoading(false)
    }
  }, [_id, type])

  useEffect(() => {
    fetchBlog()
  }, [fetchBlog])

  const refetch = useCallback(() => {
    fetchBlog()
  }, [fetchBlog])

  return {
    blog,
    loading,
    error,
    refetch
  }
}

// Hook for blog operations (create, update, delete)
export const useBlogOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const createBlog = useCallback(async (blogData) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await blogApi.createBlog(blogData)
      
      if (!result.success) {
        setError(result.error || 'Failed to create blog')
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while creating the blog'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBlog = useCallback(async (_id, blogData) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await blogApi.updateBlog(_id, blogData)
      
      if (!result.success) {
        setError(result.error || 'Failed to update blog')
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while updating the blog'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteBlog = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await blogApi.deleteBlog(id)
      
      if (!result.success) {
        setError(result.error || 'Failed to delete blog')
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while deleting the blog'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleLike = useCallback(async (blogId) => {
    try {
      const result = await blogApi.toggleLike(blogId)
      return result
    } catch (err) {
      const errorMsg = err.message || 'Failed to toggle like'
      return { success: false, error: errorMsg }
    }
  }, [])

  const toggleBookmark = useCallback(async (blogId) => {
    try {
      const result = await blogApi.toggleBookmark(blogId)
      return result
    } catch (err) {
      const errorMsg = err.message || 'Failed to toggle bookmark'
      return { success: false, error: errorMsg }
    }
  }, [])

  const uploadImage = useCallback(async (imageFile) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await blogApi.uploadImage(imageFile)
      
      if (!result.success) {
        setError(result.error || 'Failed to upload image')
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while uploading the image'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createBlog,
    updateBlog,
    deleteBlog,
    toggleLike,
    toggleBookmark,
    uploadImage,
    loading,
    error,
    clearError
  }
}

// Hook for comments
export const useComments = (blogId) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!blogId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await blogApi.getComments(blogId)
      
      if (result.success) {
        // Handle different response structures
        const responseData = result.data
        setComments(
          responseData.comments || 
          responseData.data || 
          responseData || 
          []
        )
      } else {
        setError(result.error || 'Failed to fetch comments')
        setComments([])
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching comments')
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [blogId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = useCallback(async (commentData) => {
    try {
      const result = await blogApi.addComment(blogId, commentData)
      
      if (result.success) {
        setComments(prev => [result.data, ...prev])
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Failed to add comment'
      return { success: false, error: errorMsg }
    }
  }, [blogId])

  const updateComment = useCallback(async (commentId, commentData) => {
    try {
      const result = await blogApi.updateComment(blogId, commentId, commentData)
      
      if (result.success) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === commentId ? result.data : comment
          )
        )
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Failed to update comment'
      return { success: false, error: errorMsg }
    }
  }, [blogId])

  const deleteComment = useCallback(async (commentId) => {
    try {
      const result = await blogApi.deleteComment(blogId, commentId)
      
      if (result.success) {
        setComments(prev => prev.filter(comment => comment._id !== commentId))
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete comment'
      return { success: false, error: errorMsg }
    }
  }, [blogId])

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments
  }
}

// Hook for search with debouncing
export const useSearch = (debounceMs = 300) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  // Debounced search function
  const search = useCallback(async (searchQuery, params = {}) => {
    const trimmedQuery = searchQuery?.trim()
    setQuery(trimmedQuery)
    
    if (!trimmedQuery) {
      setResults([])
      setLoading(false)
      return { success: true, data: [] }
    }

    setLoading(true)
    setError(null)
    
    try {
      const result = await blogApi.searchBlogs(trimmedQuery, params)
      
      if (result.success) {
        // Handle different response structures for search
        const responseData = result.data
        const searchResults = responseData.blogs || responseData.data || responseData || []
        setResults(searchResults)
      } else {
        setError(result.error || 'Search failed')
        setResults([])
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during search'
      setError(errorMsg)
      setResults([])
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    if (!query) return

    const timeoutId = setTimeout(() => {
      search(query)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, search, debounceMs])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
    setQuery('')
  }, [])

  return {
    results,
    loading,
    error,
    query,
    search,
    clearResults
  }
}

// Hook for categories and tags
export const useMetadata = () => {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMetadata = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [categoriesResult, tagsResult] = await Promise.all([
        blogApi.getCategories(),
        blogApi.getTags()
      ])
      
      if (categoriesResult.success) {
        // Handle different response structures
        const categoriesData = categoriesResult.data
        setCategories(categoriesData.data || categoriesData || [])
      } else {
        console.warn('Failed to fetch categories:', categoriesResult.error)
      }
      
      if (tagsResult.success) {
        // Handle different response structures
        const tagsData = tagsResult.data
        setTags(tagsData.data || tagsData || [])
      } else {
        console.warn('Failed to fetch tags:', tagsResult.error)
      }
      
      // Only set error if both requests failed
      if (!categoriesResult.success && !tagsResult.success) {
        setError('Failed to fetch metadata')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching metadata')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  return {
    categories,
    tags,
    loading,
    error,
    refetch: fetchMetadata
  }
}

// Hook for user's blog interactions (likes, bookmarks, etc.)
export const useUserBlogInteractions = (userId) => {
  const [likedBlogs, setLikedBlogs] = useState([])
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInteractions = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [likesResult, bookmarksResult] = await Promise.all([
        blogApi.getUserLikedBlogs?.(userId) || Promise.resolve({ success: true, data: [] }),
        blogApi.getUserBookmarkedBlogs?.(userId) || Promise.resolve({ success: true, data: [] })
      ])

      if (likesResult.success) {
        setLikedBlogs(likesResult.data.data || likesResult.data || [])
      }

      if (bookmarksResult.success) {
        setBookmarkedBlogs(bookmarksResult.data.data || bookmarksResult.data || [])
      }

      if (!likesResult.success && !bookmarksResult.success) {
        setError('Failed to fetch user interactions')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching user interactions')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchInteractions()
  }, [fetchInteractions])

  return {
    likedBlogs,
    bookmarkedBlogs,
    loading,
    error,
    refetch: fetchInteractions
  }
}