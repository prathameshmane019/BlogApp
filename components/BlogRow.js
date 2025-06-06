'use client';
import { Eye, Heart, MessageCircle, Star, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useBlogOperations } from '@/hooks/blogHooks';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function BlogRow({ blog, selectedItems, setSelectedItems, refetch }) {
  const router = useRouter();
  const { deleteBlog } = useBlogOperations();

  const getTagInfo = (tag) => {
    if (typeof tag === 'object' && tag !== null) {
      return {
        name: tag.name || '',
        slug: tag.slug || '',
        _id: tag._id || Math.random().toString(),
      };
    }
    return {
      name: typeof tag === 'string' ? tag : '',
      slug: '',
      _id: Math.random().toString(),
    };
  };

  const getCategoryName = (category) => {
    if (typeof category === 'object' && category !== null) {
      return category.name || 'Uncategorized';
    }
    return typeof category === 'string' ? category : 'Uncategorized';
  };

  const handleEdit = () => {
    router.push(`/admin/blogs/edit/${blog._id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      const result = await deleteBlog(blog._id);
      if (result.success) {
        toast.success('Blog deleted successfully!');
        refetch();
      } else {
        toast.error(result.error || 'Failed to delete blog');
      }
    }
  };

  const handleMoreActions = () => {
    toast('More actions coming soon!', { icon: 'ℹ️' });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200 even:bg-gray-50/50">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={selectedItems.includes(blog._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedItems([...selectedItems, blog._id]);
            } else {
              setSelectedItems(selectedItems.filter((_id) => _id !== blog._id));
            }
          }}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900 flex items-center">
              {blog.title || 'Untitled'}
              {blog.isFeatured && <Star className="w-4 h-4 text-yellow-400 ml-2 fill-current" />}
            </div>
            <div className="text-sm text-gray-500">{blog.author?.name || 'Unknown Author'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getCategoryName(blog.category)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(blog.tags) ? blog.tags.slice(0, 3) : []).map((tag) => {
            const tagInfo = getTagInfo(tag);
            return (
              <span
                key={tagInfo._id}
                className="px-4 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-xs rounded-full font-medium border border-violet-200 hover:from-violet-200 hover:to-purple-200 transition-all duration-200 cursor-pointer"
              >
                #{tagInfo.name}
              </span>
            );
          })}
          {blog.tags?.length > 3 && (
            <span className="text-xs text-gray-500">+{blog.tags.length - 3} more</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {blog.viewsCount || blog.views || 0}
          </span>
          <span className="flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            {blog.likesCount || blog.likes || 0}
          </span>
          <span className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            {blog.commentsCount || blog.comments || 0}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {blog.status || 'draft'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="relative group">
            <button
              onClick={handleEdit}
              className="p-1.5 hover:bg-blue-100 rounded-full transition-colors duration-200"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
              Edit Blog
            </div>
          </span>
          <span className="relative group">
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-100 rounded-full transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
              Delete Blog
            </div>
          </span>
          <span className="relative group">
            <button
              onClick={handleMoreActions}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
              More Actions
            </div>
          </span>
        </div>
      </td>
    </tr>
  );
}