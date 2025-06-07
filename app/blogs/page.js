'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlogCard from '../../components/BlogCard';
import { Search, Grid, List, X, Loader2 } from 'lucide-react';
import { useBlogs, useSearch, useMetadata } from '@/hooks/blogHooks';
import { toast } from 'sonner';
import debounce from 'lodash.debounce';

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { blogs, loading, error, hasMore, refetch, loadMore } = useBlogs({
    page: 1,
    limit: 9,
    category: selectedCategory,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const { categories, loading: categoriesLoading } = useMetadata();
  const { results: searchResults, search, clearResults } = useSearch();
  const observerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounced search handler
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    console.log('Search Term Updated:', value); // Debug log
  }, 500);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? '' : categoryId;
    setSelectedCategory(newCategory);
    setSearchTerm('');
    clearResults();
    console.log('Selected Category:', newCategory); // Debug log
    refetch({ page: 1, category: newCategory, search: '' });
    toast.success(newCategory ? `Filtered by ${categories.find((c) => c._id === newCategory)?.name}` : 'All categories selected');
  };

  // Handle sort change
  const handleSortChange = (newSortBy, newSortOrder = 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    console.log('Sort Changed:', { newSortBy, newSortOrder }); // Debug log
    refetch({ page: 1, sortBy: newSortBy, sortOrder: newSortOrder });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('createdAt');
    setSortOrder('desc');
    clearResults();
    if (searchInputRef.current) searchInputRef.current.value = '';
    console.log('Filters Cleared'); // Debug log
    refetch({ page: 1, category: '', search: '', sortBy: 'createdAt', sortOrder: 'desc' });
    toast.success('Filters cleared');
  };

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore, loadMore, isLoadingMore]);

  useEffect(() => {
    setIsLoadingMore(false);
  }, [blogs]);

  const displayBlogs = searchTerm && searchResults?.length > 0 ? searchResults : blogs;

  console.log('Display Blogs:', displayBlogs); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Discover Our Blog Universe
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Dive into a world of insights, stories, and ideas crafted by our passionate community.
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-12 border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search blogs..."
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400"
                aria-label="Search blogs"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all duration-200 ${
                  viewMode === 'grid' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Grid View"
                aria-label="Switch to grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all duration-200 ${
                  viewMode === 'list' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="List View"
                aria-label="Switch to list view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-3 mb-6" role="group" aria-label="Category filters">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === ''
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="All categories"
              aria-pressed={selectedCategory === ''}
            >
              All
            </motion.button>
            {categoriesLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="px-4 py-2 bg-gray-200 rounded-full animate-pulse w-20"></div>
                ))
              : categories?.map((category) => (
                  <motion.button
                    key={category._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(category._id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category._id
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label={`Filter by ${category.name}`}
                    aria-pressed={selectedCategory === category._id}
                  >
                    {category.name}
                  </motion.button>
                ))}
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Sort by:</span>
            {[
              { label: 'Latest', sortBy: 'createdAt', sortOrder: 'desc' },
              { label: 'Oldest', sortBy: 'createdAt', sortOrder: 'asc' },
              { label: 'Most Liked', sortBy: 'likesCount', sortOrder: 'desc' },
              { label: 'Most Viewed', sortBy: 'viewsCount', sortOrder: 'desc' },
              { label: 'A-Z', sortBy: 'title', sortOrder: 'asc' },
            ].map((option) => (
              <motion.button
                key={option.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSortChange(option.sortBy, option.sortOrder)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  sortBy === option.sortBy && sortOrder === option.sortOrder
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`Sort by ${option.label}`}
                aria-pressed={sortBy === option.sortBy && sortOrder === option.sortOrder}
              >
                {option.label}
              </motion.button>
            ))}
            {(searchTerm || selectedCategory || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4 inline mr-1" /> Clear All
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
              <p className="text-red-700">Error loading blogs: {error}</p>
              <button
                onClick={() => refetch()}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                aria-label="Retry loading blogs"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Info */}
        {!loading && displayBlogs?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <p className="text-gray-600 text-lg">
              {searchTerm ? (
                <>Showing {displayBlogs.length} results for &quot;{searchTerm}&quot;</>
              ) : selectedCategory ? (
                <>Showing blogs in &quot;{categories.find((c) => c._id === selectedCategory)?.name || 'Selected Category'}&quot;</>
              ) : (
                <>Showing {displayBlogs.length} blogs</>
              )}
            </p>
          </motion.div>
        )}

        {/* Blog Grid/List */}
        <AnimatePresence>
          {loading && !isLoadingMore ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >
                  <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded-full w-1/3 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded-full w-2/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded-full w-20 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded-full w-16 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                {displayBlogs?.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <BlogCard blog={blog} viewMode={viewMode} />
                  </motion.div>
                ))}
              </div>

              {displayBlogs?.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Blogs Found</h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    {searchTerm ? (
                      <>No results found for &quot;{searchTerm}&quot;. Try different keywords.</>
                    ) : selectedCategory ? (
                      <>No blogs found in this category. Try selecting a different category.</>
                    ) : (
                      <>No blogs available at the moment.</>
                    )}
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearFilters}
                      className="px-6 py-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all duration-200 text-lg"
                      aria-label="Clear all filters"
                    >
                      Clear Filters
                    </motion.button>
                  )}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && (
          <div ref={observerRef} className="flex justify-center py-12">
            {isLoadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2"
              >
                <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                <span className="text-gray-600">Loading more blogs...</span>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}