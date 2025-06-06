'use client'
// pages/blogs/index.js
import { useState, useEffect } from 'react' 
import BlogCard from '../../components/BlogCard'
import { Search, Filter, Grid, List } from 'lucide-react'
import { useBlogs, useSearch, useMetadata} from '@/hooks/blogHooks'

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Use custom hooks
  const { 
    blogs, 
    loading, 
    error, 
    totalPages,
    total,
    refetch 
  } = useBlogs({
    page: currentPage,
    limit: 9,
    category: selectedCategory,
    search: searchTerm,
    sortBy,
    sortOrder
  })

  const { categories, loading: categoriesLoading } = useMetadata()
  const { results: searchResults, search, clearResults } = useSearch()

  // Effect to refetch blogs when filters change
  useEffect(() => {
    refetch({
      page: currentPage,
      limit: 9,
      category: selectedCategory,
      search: searchTerm,
      sortBy,
      sortOrder
    })
  }, [currentPage, selectedCategory, searchTerm, sortBy, sortOrder])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    // The useEffect will handle the refetch
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    setSearchTerm('') // Clear search when changing category
    clearResults()
  }

  const handleSortChange = (newSortBy, newSortOrder = 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayBlogs = searchTerm && searchResults?.length > 0 ? searchResults : blogs

  return ( 
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Blog Collection
          </h1>
          <p className="text-gray-600">
            Discover insights, stories, and ideas from our community of writers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={categoriesLoading}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {categories && categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-600'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-600'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <button
              onClick={() => handleSortChange('createdAt', 'desc')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'createdAt' && sortOrder === 'desc'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => handleSortChange('createdAt', 'asc')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'createdAt' && sortOrder === 'asc'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => handleSortChange('likesCount', 'desc')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'likesCount'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Most Liked
            </button>
            <button
              onClick={() => handleSortChange('viewsCount', 'desc')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'viewsCount'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Most Viewed
            </button>
            <button
              onClick={() => handleSortChange('title', 'asc')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'title'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
              <p className="text-red-700">Error loading blogs: {error}</p>
              <button 
                onClick={() => refetch()}
                className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        {!loading && displayBlogs?.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              {searchTerm ? (
                <>Showing {displayBlogs?.length} results for "{searchTerm}"</>
              ) : selectedCategory ? (
                <>Showing blogs in "{categories?.find(c => c._id === selectedCategory)?.name || selectedCategory}"</>
              ) : (
                <>Showing {displayBlogs?.length} of {total} blogs</>
              )}
            </p>
          </div>
        )}

        {/* Blog Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300" />
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2" />
                  <div className="h-6 bg-gray-300 rounded mb-3" />
                  <div className="h-4 bg-gray-300 rounded mb-4" />
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-300 rounded w-20" />
                    <div className="h-6 bg-gray-300 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                : 'space-y-6'
            }`}>
              {displayBlogs?.map((blog) => (
                <BlogCard 
                  key={blog._id} 
                  blog={blog} 
                  viewMode={viewMode}
                />
              ))}
            </div>

            {displayBlogs?.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? (
                    <>No results found for &quot;{searchTerm}&quot;. Try different keywords.</>
                  ) : selectedCategory ? (
                    <>No blogs found in this category. Try selecting a different category.</>
                  ) : (
                    <>No blogs available at the moment.</>
                  )}
                </p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('')
                      clearResults()
                    }}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !searchTerm && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Smart pagination - show limited page numbers */}
                  {(() => {
                    const delta = 2
                    const range = []
                    const rangeWithDots = []

                    // Handle single page case
                    if (totalPages === 1) {
                      return (
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="px-4 py-2 rounded-lg bg-violet-600 text-white"
                        >
                          1
                        </button>
                      )
                    }

                    for (let i = Math.max(2, currentPage - delta); 
                         i <= Math.min(totalPages - 1, currentPage + delta); 
                         i++) {
                      range.push(i)
                    }

                    if (currentPage - delta > 2) {
                      rangeWithDots.push(1, '...')
                    } else {
                      rangeWithDots.push(1)
                    }

                    rangeWithDots.push(...range)

                    if (currentPage + delta < totalPages - 1) {
                      rangeWithDots.push('...', totalPages)
                    } else if (totalPages > 1) {
                      rangeWithDots.push(totalPages)
                    }

                    return rangeWithDots.map((page, index) => (
                      page === '...' ? (
                        <span key={index} className="px-4 py-2 text-gray-500">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-violet-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))
                  })()}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div> 
  )
}