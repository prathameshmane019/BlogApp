"use client"
import { useState, useEffect } from 'react'
import { ChevronRight, Sparkles, TrendingUp, Users, Heart, Clock, Eye, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock BlogCard component
const BlogCard = ({ blog }) => (
 
  <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200">
    <div className="aspect-video bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute bottom-4 left-4 right-4">
        <span className="inline-block bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
          {blog.category || 'Tech'}
        </span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
        {blog.title || 'Sample Blog Title'}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {blog.excerpt || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          <span className="text-sm text-gray-700 font-medium">{blog.author || 'John Doe'}</span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>5 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>1.2k</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function Home() {
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [recentBlogs, setRecentBlogs] = useState([])
  const [stats, setStats] = useState({
    totalBlogs: 1250,
    totalAuthors: 340,
    totalReads: 45600
  })

  useEffect(() => {
    // Mock data for demonstration
    const mockBlogs = [
      { _id: '1', title: 'The Future of Web Development', category: 'Tech', author: 'Sarah Chen' },
      { _id: '2', title: 'Designing for Accessibility', category: 'Design', author: 'Mike Johnson' },
      { _id: '3', title: 'The Art of Storytelling', category: 'Writing', author: 'Emma Davis' },
      { _id: '4', title: 'Machine Learning Basics', category: 'AI', author: 'David Kim' },
      { _id: '5', title: 'Sustainable Living Tips', category: 'Lifestyle', author: 'Lisa Wang' },
      { _id: '6', title: 'Photography Techniques', category: 'Art', author: 'Tom Brown' }
    ]
    
    setFeaturedBlogs(mockBlogs.slice(0, 3))
    setRecentBlogs(mockBlogs)
  }, [])

  return (
     <>
  <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-500/10 to-orange-400/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
          </div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-purple-200/50 shadow-lg">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-sm font-semibold text-purple-700">Welcome to BlogSpace</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-none tracking-tight">
            Where Stories
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Come Alive
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover amazing stories, insights, and ideas from our community of passionate writers. 
            Join thousands of readers exploring the world through words.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-3 hover:scale-105">
              <span>Explore Blogs</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group border-2 border-purple-600 text-purple-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-purple-600 hover:text-white transition-all duration-300 hover:shadow-lg">
              Start Writing
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 mb-3">{stats.totalBlogs.toLocaleString()}+</h3>
              <p className="text-gray-600 text-lg font-medium">Published Articles</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 mb-3">{stats.totalAuthors.toLocaleString()}+</h3>
              <p className="text-gray-600 text-lg font-medium">Active Writers</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 mb-3">{stats.totalReads.toLocaleString()}+</h3>
              <p className="text-gray-600 text-lg font-medium">Total Reads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Featured Content</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Featured Stories</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                Hand-picked articles that showcase the best of our community&apos;s creativity and insights.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Blogs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
            <div className="mb-6 md:mb-0">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">Latest Articles</h2>
              <p className="text-xl text-gray-600 font-medium">Fresh perspectives and new ideas from our community.</p>
            </div>
            <button className="group flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-bold text-lg">
              <span>View All</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
          </div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Join our community of writers and readers. Share your thoughts, experiences, and insights with the world.
          </p>
          <button className="group bg-white text-purple-600 px-12 py-6 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3 mx-auto hover:scale-105">
            <span>Get Started Today</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
    <Footer/>
    </>
  )
}