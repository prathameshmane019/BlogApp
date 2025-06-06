"use client"
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation' 
import { Calendar, User, Clock, Share2, Heart, BookOpen, Eye, ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react'
import Image from 'next/image' 
import { useBlog, useBlogOperations } from '@/hooks/blogHooks'

export default function BlogPost({params}) { 
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [readTime, setReadTime] = useState(0)
  const [views, setViews] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const router = useRouter();
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams; 
  const { blog, loading, error, refetch } = useBlog(slug, 'slug')
  const { toggleLike, loading: operationLoading } = useBlogOperations()

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (blog && blog.content) {
      setLikes(blog.likesCount || 0);
      setViews(blog.viewsCount || 0);
      setLiked(blog.isLiked || false);
      calculateReadTime(blog.content);
    }
  }, [blog]);

  const calculateReadTime = (content) => {
    if (!content) return;
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    const time = Math.ceil(words / wordsPerMinute);
    setReadTime(time);
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/blogs/${blog?._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setLiked(!liked)
        setLikes(likes + (liked ? -1 : 1))
      }
    } catch (error) {
      console.error('Failed to like blog:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Safe data extraction helpers
  const getAuthorInfo = (author) => {
    if (typeof author === 'object' && author !== null) {
      return {
        name: author.name || author.username || 'Anonymous',
        email: author.email || '',
        bio: author.bio || author.description || '',
        avatar: author.avatar || author.profileImage || ''
      }
    }
    return {
      name: typeof author === 'string' ? author : 'Anonymous',
      email: '',
      bio: '',
      avatar: ''
    }
  }

  const getCategoryInfo = (category) => {
    if (typeof category === 'object' && category !== null) {
      return {
        name: category.name || 'Uncategorized',
        slug: category.slug || '',
        color: category.color || 'violet'
      }
    }
    return {
      name: typeof category === 'string' ? category : 'Uncategorized',
      slug: '',
      color: 'violet'
    }
  }

  const getTagInfo = (tag) => {
    if (typeof tag === 'object' && tag !== null) {
      return {
        name: tag.name || '',
        slug: tag.slug || '',
        _id: tag._id || Math.random().toString()
      }
    }
    return {
      name: typeof tag === 'string' ? tag : '',
      slug: '',
      _id: Math.random().toString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-32"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl"></div>
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-2/3"></div>
            </div>
            <div className="h-80 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl"></div>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full" ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <ExternalLink className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Blog Post Not Found</h1>
          <p className="text-slate-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const authorInfo = getAuthorInfo(blog.author)
  const categoryInfo = getCategoryInfo(blog.category)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Floating Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          {isScrolled && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  liked
                    ? 'bg-red-100 text-red-600 shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{likes}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all duration-200"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Header Section */}
        <header className="mb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
            <span>Blog</span>
            <span>/</span>
            <span className="text-violet-600 font-medium">{categoryInfo.name}</span>
          </nav>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-8">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200">
              <Calendar className="w-4 h-4 text-violet-500" />
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200">
              <User className="w-4 h-4 text-violet-500" />
              <span>{authorInfo.name}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200">
              <Clock className="w-4 h-4 text-violet-500" />
              <span>{readTime} min read</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200">
              <Eye className="w-4 h-4 text-violet-500" />
              <span>{views.toLocaleString()} views</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl text-slate-600 mb-8 leading-relaxed font-light">
              {blog.excerpt}
            </p>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={operationLoading}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${
                  liked
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-3 px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-md hover:shadow-lg border border-slate-200"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                <span className="font-medium">{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {blog.tags?.slice(0, 3).map((tag) => {
                const tagInfo = getTagInfo(tag)
                return (
                  <span
                    key={tagInfo._id}
                    className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-sm rounded-full font-medium border border-violet-200 hover:from-violet-200 hover:to-purple-200 transition-all duration-200 cursor-pointer"
                  >
                    #{tagInfo.name}
                  </span>
                )
              })}
              {blog.tags?.length > 3 && (
                <span className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-full font-medium">
                  +{blog.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.image && (
          <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-2xl">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none mb-16">
          <div
            dangerouslySetInnerHTML={{ __html: blog.content }}
            className="text-slate-800 leading-relaxed [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-12 [&>h1]:mb-6 [&>h1]:text-slate-900 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-slate-800 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-slate-700 [&>p]:mb-6 [&>p]:text-lg [&>p]:leading-8 [&>blockquote]:border-l-4 [&>blockquote]:border-violet-500 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:bg-violet-50 [&>blockquote]:py-4 [&>blockquote]:rounded-r-lg [&>ul]:space-y-2 [&>ol]:space-y-2 [&>li]:text-lg"
          />
        </div>

        {/* Author Section */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 mb-12 border border-slate-200 shadow-lg">
          <div className="flex items-start space-x-6">
            <div className="relative">
              {authorInfo.avatar ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden">
                  <Image
                    src={authorInfo.avatar}
                    alt={authorInfo.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{authorInfo.name}</h3>
              <p className="text-slate-600 leading-relaxed">
                {authorInfo.bio || "Passionate writer and content creator sharing insights and stories with the world."}
              </p>
              {authorInfo.email && (
                <p className="text-sm text-violet-600 mt-2 font-medium">{authorInfo.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Related/Category Info */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Explore More in {categoryInfo.name}</h3>
              <p className="text-violet-100">Discover similar articles and insights</p>
            </div>
            <BookOpen className="w-12 h-12 text-violet-200" />
          </div>
        </div>
      </article>
    </div>
  )
}