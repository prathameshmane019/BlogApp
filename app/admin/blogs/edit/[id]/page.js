'use client';
import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useMetadata } from '@/hooks/blogHooks';
import { useBlog, useBlogOperations } from '@/hooks/blogHooks';
import { toast } from 'sonner';

export default function EditBlog({params}) {
  const router = useRouter();
   const unwrappedParams = use(params);
  const { id } = unwrappedParams; 
  // console.log('EditBlog: ID from useParams:', id); // Debug: Log the ID

  const { blog, loading: blogLoading, error: blogError } = useBlog(id,'id');
  console.log('EditBlog: useBlog state:', { blog, blogLoading, blogError }); // Debug: Log useBlog state

  const { categories, tags, loading: metadataLoading, error: metadataError } = useMetadata();
  // console.log('EditBlog: useMetadata state:', { categories, tags, metadataLoading, metadataError }); // Debug: Log useMetadata state

  console.log("Blog Data:",blog);
  const { updateBlog } = useBlogOperations();
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (blog) {
      console.log('EditBlog: Blog data received:', blog); // Debug: Log the blog data
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        category: blog.category?._id || '',
        tags: blog.tags?.map((tag) => tag._id) || [],
        status: blog.status || 'draft',
        featuredImage: blog.featuredImage || '',
        isFeatured: blog.isFeatured || false,
      });
      console.log('EditBlog: FormData set to:', formData); // Debug: Log formData after setting
    }
  }, [blog]);

  useEffect(() => {
    console.log('EditBlog: FormData updated:', formData); // Debug: Log formData changes
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'tags') {
      const selectedTags = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, tags: selectedTags });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await updateBlog(id, formData);
      if (response.success) {
        toast.success('Blog updated successfully!');
        router.push('/admin/blogs');
      } else {
        toast.error(response.error || 'Failed to update blog');
      }
    } catch (error) {
      toast.error('An error occurred while updating the blog');
    } finally {
      setSubmitting(false);
    }
  };

  if (blogLoading || metadataLoading || !formData) {
    console.log('EditBlog: Rendering loading state', { blogLoading, metadataLoading, formData }); // Debug: Log why loading state is active
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (blogError || metadataError) {
    return <div className="text-center text-red-500 p-6">{blogError || metadataError}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
        <button
          onClick={() => router.push('/admin/blogs')}
          className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
          Back to Blogs
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-lg">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter blog title"
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="A short summary of the blog..."
            rows="3"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your blog content here..."
            rows="10"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <select
            name="tags"
            multiple
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tags.map((tag) => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple tags
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste image URL (optional)"
            />
          </div>
        </div>

        {/* Is Featured */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">Mark as Featured</label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {submitting ? 'Updating...' : 'Update Blog'}
          </button>
        </div>
      </form>
    </div>
  );
}