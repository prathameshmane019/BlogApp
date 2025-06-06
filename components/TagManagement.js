import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useMetadata } from '@/hooks/blogHooks';
import { blogApi } from '@/app/services/blogApi';

export default function TagManagement() {
  const { tags, loading, error, refetch } = useMetadata();
  const [newTag, setNewTag] = useState('');

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const result = await blogApi.createTag({ name: newTag }); // Assume createTag endpoint
      if (result.success) {
        setNewTag('');
        refetch();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to add tag');
    }
  };

  const handleDeleteTag = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        const result = await blogApi.deleteTag(id); // Assume deleteTag endpoint
        if (result.success) {
          refetch();
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('Failed to delete tag');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="New tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag._id}
                className="flex items-center bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 mr-2">{tag.name}</span>
                <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 mr-2">{tag.count}</span>
                <button onClick={() => handleDeleteTag(tag._id)} className="text-gray-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}