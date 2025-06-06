import { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react'; 
import { blogApi } from '@/app/services/blogApi';
import { useBlogs } from '@/hooks/blogHooks';

export default function Analytics() {
    const { blogs } = useBlogs();
    const [trafficData, setTrafficData] = useState([]);

    useEffect(() => {
        const fetchTrafficData = async () => {
            try {
                const response = await blogApi.getTrafficData(); // Assume traffic data endpoint
                if (response.success) {
                    setTrafficData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch traffic data:', error);
            }
        };
        fetchTrafficData();
    }, []);

    // Sample chart for traffic overview
    const chartData = {
        type: 'pie',
        data: {
            labels: trafficData.map((item) => item.source),
            datasets: [
                {
                    data: trafficData.map((item) => item.views),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                },
            ],
        },
        options: {
            plugins: {
                legend: { position: 'right' },
            },
        },
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <PieChart className="w-16 h-16 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Posts</h3>
                    <div className="space-y-4">
                        {blogs.slice(0, 5).map((blog, index) => (
                            <div key={blog._id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-900">{blog.title}</span>
                                </div>
                                <span className="text-sm text-gray-500">{blog.views} views</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}