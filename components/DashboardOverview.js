import { useEffect, useState } from 'react';
import { Eye, FileText, Users, MessageCircle, Plus } from 'lucide-react';
import StatCard from './StatCard';
import { useMetadata } from '@/hooks/blogHooks';
import { blogApi } from '@/app/services/blogApi';

export default function DashboardOverview() {
  const { categories, loading: metadataLoading, error: metadataError, refetch } = useMetadata();
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    totalBlogs: 0,
    totalUsers: 0,
    totalComments: 0,
    viewsGrowth: 0,
    blogsGrowth: 0,
    usersGrowth: 0,
    commentsGrowth: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch analytics data
        const analyticsResponse = await blogApi.getAnalytics();
        if (analyticsResponse.success) {
          setAnalyticsData(analyticsResponse.data);
        } else {
          setError(analyticsResponse.error);
        }

        // Fetch recent activities
        const activityResponse = await blogApi.getRecentActivity();
        if (activityResponse.success) {
          setRecentActivity(activityResponse.data.slice(0, 4));
        } else {
          setError(activityResponse.error);
        }
      } catch (error) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Blog
        </button>
      </div>

      {loading || metadataLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error || metadataError ? (
        <p className="text-center text-red-500">{error || metadataError}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Views"
              value={analyticsData.totalViews}
              growth={analyticsData.viewsGrowth}
              icon={Eye}
              color="blue"
            />
            <StatCard
              title="Total Blogs"
              value={analyticsData.totalBlogs}
              growth={analyticsData.blogsGrowth}
              icon={FileText}
              color="green"
            />
            <StatCard
              title="Total Users"
              value={analyticsData.totalUsers}
              growth={analyticsData.usersGrowth}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Comments"
              value={analyticsData.totalComments}
              growth={analyticsData.commentsGrowth}
              icon={MessageCircle}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent activities available</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
              {categories.length > 0 ? (
                <div className="space-y-3">
                  {categories.slice(0, 4).map((category) => (
                    <div key={category._id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.count} posts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}