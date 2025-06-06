
// components/BlogCard.js
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight, Bold } from 'lucide-react'

export default function BlogCard({ blog }) {

  console.log(blog);
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
  return (
    <article className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={blog.image || '/placeholder-blog.jpg'}
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{blog.author}</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-violet-600 transition-colors">
          {blog.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {blog.excerpt || blog.content.substring(0, 150) + '...'}
        </p>

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

          <Link
            href={`/blogs/${blog.slug}`}
            className="flex items-center space-x-1 text-violet-600 hover:text-violet-700 font-medium text-sm group"
          >
            <span>Read More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}
