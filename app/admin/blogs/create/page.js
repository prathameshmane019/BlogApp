'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Loader2, 
  Trash2, 
  Upload, 
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import { useMetadata, useBlogOperations } from '@/hooks/blogHooks';
import { toast } from 'sonner';
import { blogApi } from '@/app/services/blogApi';

export default function CreateBlog() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { categories, tags, loading: metadataLoading, error: metadataError } = useMetadata();
  const { createBlog } = useBlogOperations();
  
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
  const [uploadedImages, setUploadedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length < 20) {
      newErrors.excerpt = 'Excerpt must be at least 20 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
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
    processImageFiles(files);
  };

  const processImageFiles = (files) => {
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isImage) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImageFiles(prev => [...prev, ...validFiles]);
    
    const previews = validFiles.map((file, index) => ({
      id: Date.now() + index, // Unique ID for each preview
      url: URL.createObjectURL(file),
      file,
      uploaded: false,
      name: file.name,
      size: file.size
    }));
    
    setImagePreviews(prev => [...prev, ...previews]);
    
    // Initialize metadata for new images
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles.map(() => ({ altText: '', caption: '' }))],
    }));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveImage = (index) => {
    // Revoke object URL to prevent memory leaks
    if (imagePreviews[index]?.url) {
      URL.revokeObjectURL(imagePreviews[index].url);
    }
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageMetadataChange = (index, field, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], [field]: value };
      return { ...prev, images: newImages };
    });
  };

  const handleUploadImages = async () => {
    if (!imageFiles || imageFiles.length === 0) {
      toast.info('No new images to upload');
      return;
    }

    const validFiles = imageFiles.filter(file => file instanceof File);
    if (validFiles.length === 0) {
      toast.error('No valid files to upload');
      return;
    }

    setUploadingImages(true);
    try {
      const altTexts = formData.images.map(img => img.altText || '');
      const captions = formData.images.map(img => img.caption || '');

      const response = await blogApi.uploadImages(validFiles, altTexts, captions);

      if (response.success) {
        toast.success(`Successfully uploaded ${response.data.length} image(s)!`);
        
        setUploadedImages(prev => [...prev, ...response.data]);

        // Update previews to show uploaded status
        setImagePreviews(prev =>
          prev.map((preview, index) => ({
            ...preview,
            uploaded: true,
            uploadedData: response.data[index] || null
          }))
        );

        // Clear pending files
        setImageFiles([]);

        // Update form data with uploaded image data
        setFormData(prev => ({
          ...prev,
          images: [...prev.images.slice(0, prev.images.length - validFiles.length), ...response.data]
        }));

      } else {
        toast.error(response.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred while uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }
    
    if (imageFiles.length > 0) {
      toast.error('Please upload all images before submitting the blog.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedFormData = { 
        ...formData, 
        images: uploadedImages.length > 0 ? uploadedImages : formData.images 
      };

      const response = await createBlog(updatedFormData);
      if (response.success) {
        toast.success('Blog created successfully!');
        router.push('/admin/blogs');
      } else {
        toast.error(response.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Create Blog Error:', error);
      toast.error('An error occurred while creating the blog');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Loading state
  if (metadataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading categories and tags...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (metadataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-4">{metadataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasUnuploadedImages = imageFiles.length > 0;
  const hasImages = imagePreviews.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
            <p className="text-gray-600 mt-1">Share your thoughts with the world</p>
          </div>
          <button
            onClick={() => router.push('/admin/blogs')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blogs
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter an engaging blog title..."
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.excerpt ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Write a compelling summary that will make readers want to read more..."
                rows="3"
              />
              {errors.excerpt && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.excerpt}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will appear in blog previews and search results
              </p>
            </div>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Write your blog content here... Use [IMAGE_0], [IMAGE_1], etc. to position images in your content."
                rows="12"
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.content}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Use [IMAGE_X] to place images (e.g., [IMAGE_0] for first image)</span>
                <span>{formData.content.length} characters</span>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Images</h3>
              {hasImages && (
                <button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={uploadingImages || !hasUnuploadedImages}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    hasUnuploadedImages && !uploadingImages
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {uploadingImages ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {uploadingImages ? 'Uploading...' : hasUnuploadedImages ? 'Upload Images' : 'All Uploaded'}
                </button>
              )}
            </div>
            
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative w-full p-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 cursor-pointer ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                {isDragOver ? 'Drop your images here' : 'Upload Images'}
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop images here, or click to browse
              </p>
              <div className="text-xs text-gray-400">
                Supports: JPG, PNG, GIF • Max size: 5MB per image
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Upload Warning */}
            {hasUnuploadedImages && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                  <p className="text-sm text-amber-800">
                    You have {imageFiles.length} image(s) ready to upload. Upload them before submitting your blog.
                  </p>
                </div>
              </div>
            )}

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Image Previews ({imagePreviews.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {imagePreviews.map((preview, index) => (
                    <div 
                      key={preview.id} 
                      className="relative bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        
                        {/* Upload Status Badge */}
                        <div className="absolute top-2 left-2">
                          {preview.uploaded ? (
                            <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Uploaded
                            </div>
                          ) : (
                            <div className="flex items-center bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              <Upload className="w-3 h-3 mr-1" />
                              Pending
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Image Info */}
                        <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="truncate">{preview.name}</div>
                          <div>{formatFileSize(preview.size)}</div>
                        </div>
                      </div>

                      {/* Image Metadata */}
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Alt Text (for accessibility)
                          </label>
                          <input
                            type="text"
                            value={formData.images[index]?.altText || ''}
                            onChange={(e) => handleImageMetadataChange(index, 'altText', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe the image..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Caption (optional)
                          </label>
                          <input
                            type="text"
                            value={formData.images[index]?.caption || ''}
                            onChange={(e) => handleImageMetadataChange(index, 'caption', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add a caption..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Blog Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Blog Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <select
                name="tags"
                multiple
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                size="4"
              >
                {tags.map((tag) => (
                  <option key={tag._id} value={tag._id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple tags
              </p>
            </div>

            {/* Featured Toggle */}
            <div className="mt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Mark as Featured
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  (Featured blogs appear prominently on the homepage)
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/blogs')}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || hasUnuploadedImages}
              className={`px-8 py-3 rounded-xl flex items-center font-medium transition-all duration-300 ${
                submitting || hasUnuploadedImages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {submitting ? 'Creating Blog...' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}