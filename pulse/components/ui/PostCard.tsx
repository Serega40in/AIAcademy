'use client';

import Image from 'next/image';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

type Post = {
  id: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  author: { username: string; avatar_url?: string };
  created_at: string;
  read_time?: number;
  type: 'article' | 'podcast' | 'video';
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="post-card group bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10">
      {post.cover_image && (
        <div className="relative h-64">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 right-4 px-3 py-1 text-xs font-medium bg-black/70 backdrop-blur rounded-full">
            {post.type === 'podcast' ? 'Подкаст' : post.type === 'video' ? 'Видео' : 'Статья'}
          </div>
        </div>
      )}

      <div className="p-8">
        <h2 className="text-2xl font-semibold leading-tight mb-3 group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h2>

        <p className="text-zinc-400 line-clamp-3 mb-6">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-zinc-500">
          <div className="flex items-center gap-3">
            {post.author.avatar_url ? (
              <Image src={post.author.avatar_url} alt="" width={28} height={28} className="rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
            <span>@{post.author.username}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.created_at), 'dd MMM')}</span>
            </div>
            {post.read_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.read_time} мин</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}