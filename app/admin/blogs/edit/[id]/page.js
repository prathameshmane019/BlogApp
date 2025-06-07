'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useMetadata, useBlog, useBlogOperations } from '@/hooks/blogHooks';
import { toast } from 'sonner';

export default function EditBlog({params}) {
  const router = useRouter();
    const unwrappedParams = use(params);
  const { id } = unwrappedParams; 
  const { blog, loading: blogLoading, error: blogError, refetch } = useBlog(id, 'id');
  const { categories, tags, loading: metadataLoading, error: metadataError } = useMetadata();
  const { updateBlog, uploadImages } = useBlogOperations();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    isFeatured: false,
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        category: blog.category?._id || '',
        tags: blog.tags?.map((tag) => tag._id) || [],
        status: blog.status || 'draft',
        isFeatured: blog.isFeatured || false,
        images: blog.images || [],
      });
      setImagePreviews(blog.images?.map((img) => ({ url: img.url })) || []);
    }
  }, [blog]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews((prev) => [...prev, ...previews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files.map(() => ({ altText: '', caption: '' }))],
    }));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews((prev) => [...prev, ...previews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files.map(() => ({ altText: '', caption: '' }))],
    }));
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageMetadataChange = (index, field, value) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], [field]: value };
      return { ...prev, images: newImages };
    });
  };

  const handleUploadImages = async () => {
    if (imageFiles.length === 0) return formData.images;

    setSubmitting(true);
    try {
      const altTexts = formData.images.slice(-imageFiles.length).map((img) => img.altText || '');
      const captions = formData.images.slice(-imageFiles.length).map((img) => img.caption || '');
      const response = await uploadImages(imageFiles, altTexts, captions);
      if (response.success) {
        toast.success('Images uploaded successfully!');
        setImageFiles([]);
        return [...formData.images.slice(0, -imageFiles.length), ...response.data];
      } else {
        toast.error(response.error || 'Failed to upload images');
        return formData.images;
      }
    } catch (error) {
      toast.error('An error occurred while uploading images');
      return formData.images;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const uploadedImages = await handleUploadImages();
    const updatedFormData = { ...formData, images: uploadedImages };

    try {
      const response = await updateBlog(id, updatedFormData);
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

  if (blogLoading || metadataLoading) {
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your blog content here... (Use [IMAGE_X] to indicate where to place image X)"
            rows="10"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Use [IMAGE_X] in content to place images (e.g., [IMAGE_0] for first image)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-500 transition-all duration-200"
          >
            <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop images here or click to select
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700"
            >
              Select Images
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative p-4 border rounded-xl">
                  <img
                    src={preview.url}
                    alt={`Preview ${index}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                    <input
                      type="text"
                      value={formData.images[index]?.altText || ''}
                      onChange={(e) => handleImageMetadataChange(index, 'altText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      placeholder="Enter alt text"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Caption</label>
                    <input
                      type="text"
                      value={formData.images[index]?.caption || ''}
                      onChange={(e) => handleImageMetadataChange(index, 'caption', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      placeholder="Enter caption"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
            {submitting ? 'Saving...' : 'Update Blog'}
          </button>
        </div>
      </form>
    </div>
  );
}