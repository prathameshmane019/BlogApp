"use client"
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useMetadata } from '@/hooks/blogHooks';
import { blogApi } from '@/app/services/blogApi';

export default function CategoryManagement() {
  const { categories, loading, error, refetch } = useMetadata();
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const result = await blogApi.createCategory({ name: newCategory }); // Assume createCategory endpoint
      if (result.success) {
        setNewCategory('');
        refetch();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const result = await blogApi.deleteCategory(id); // Assume deleteCategory endpoint
        if (result.success) {
          refetch();
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="New category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDeleteCategory(category._id)} className="p-1 hover:bg-gray-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">/{category.slug}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{category.count}</span>
                <span className="text-sm text-gray-500">posts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}