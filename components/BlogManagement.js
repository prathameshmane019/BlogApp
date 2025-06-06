'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, ArrowUpDown } from 'lucide-react';
import { useBlogs, useSearch, useBlogOperations } from '@/hooks/blogHooks';
import { useMetadata } from '@/hooks/blogHooks';
import BlogRow from './BlogRow';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'sonner';

export default function BlogManagement() {
  const router = useRouter();
  const { blogs, loading, error, refetch, totalPages, currentPage, hasMore, loadMore } = useBlogs();
  const { search, results, query, loading: searchLoading, error: searchError } = useSearch();
  const { categories, tags, loading: metadataLoading, error: metadataError } = useMetadata();
  const { deleteBlog } = useBlogOperations();
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    tags: [],
  });

  const displayedBlogs = query ? results : blogs;
  const isLoading = loading || searchLoading || metadataLoading;
  const combinedError = error || searchError || metadataError;

  // Apply sorting
  const sortedBlogs = [...displayedBlogs].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;

    if (key === 'viewsCount') {
      return ((a.viewsCount || a.views || 0) - (b.viewsCount || b.views || 0)) * direction;
    }
    if (key === 'createdAt') {
      return (new Date(a.createdAt) - new Date(b.createdAt)) * direction;
    }
    return a[key].localeCompare(b[key]) * direction;
  });

  // Apply filters
  const filteredBlogs = sortedBlogs.filter((blog) => {
    const matchesCategory = filters.category
      ? blog.category?.name === filters.category || (!blog.category && filters.category === 'Uncategorized')
      : true;
    const matchesStatus = filters.status ? blog.status === filters.status : true;
    const matchesTags =
      filters.tags.length > 0
        ? filters.tags.every((tag) =>
            blog.tags?.some((blogTag) => blogTag.name === tag || blogTag === tag)
          )
        : true;
    return matchesCategory && matchesStatus && matchesTags;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredBlogs.map((blog) => blog._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleCreateBlog = () => {
    router.push('/admin/blogs/create');
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterApply = () => {
    setFilterModalOpen(false);
    toast.success('Filters applied!');
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} blog(s)?`)) {
      try {
        const deletePromises = selectedItems.map((id) => deleteBlog(id));
        const results = await Promise.all(deletePromises);
        const failed = results.filter((result) => !result.success);
        if (failed.length === 0) {
          toast.success(`${selectedItems.length} blog(s) deleted successfully!`);
          setSelectedItems([]);
          refetch();
        } else {
          toast.error(`Failed to delete ${failed.length} blog(s)`);
        }
      } catch (error) {
        toast.error('An error occurred while deleting blogs');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Container (add this to your app root if not already present) */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
        <button
          onClick={handleCreateBlog}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center shadow-md transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Blog
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <p className="text-sm text-blue-800">
            {selectedItems.length} blog(s) selected
          </p>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs by title, author, or tags..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                value={query}
                onChange={(e) => search(e.target.value)}
              />
            </div>
            <button
              onClick={() => setFilterModalOpen(true)}
              className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center shadow-sm transition-all duration-200"
            >
              <Filter className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-gray-700 font-medium">Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedItems.length === filteredBlogs.length && filteredBlogs.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button className="flex items-center" onClick={() => handleSort('title')}>
                    Title
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button className="flex items-center" onClick={() => handleSort('viewsCount')}>
                    Stats
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button className="flex items-center" onClick={() => handleSort('createdAt')}>
                    Date
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-6 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Loading blogs...
                    </div>
                  </td>
                </tr>
              ) : combinedError ? (
                <tr>
                  <td colSpan="8" className="px-6 py-6 text-center text-red-500">
                    {combinedError}
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-6 text-center text-gray-500">
                    No blogs found. Try adjusting your filters or search query.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <BlogRow
                    key={blog._id}
                    blog={blog}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    refetch={refetch}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!query && totalPages > 1 && (
          <div className="p-5 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="space-x-3">
              <button
                onClick={() => refetch({ page: currentPage - 1 })}
                disabled={currentPage === 1}
                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <button
                onClick={loadMore}
                disabled={!hasMore}
                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <Transition appear show={filterModalOpen} as="div">
        <Dialog as="div" className="relative z-50" onClose={() => setFilterModalOpen(false)}>
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as="div"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    Filter Blogs
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        <option value="Uncategorized">Uncategorized</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    {/* Tags Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <select
                        multiple
                        value={filters.tags}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            tags: Array.from(e.target.selectedOptions, (option) => option.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {tags.map((tag) => (
                          <option key={tag._id} value={tag.name}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple tags
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50"
                      onClick={() => setFilterModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                      onClick={handleFilterApply}
                    >
                      Apply Filters
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}