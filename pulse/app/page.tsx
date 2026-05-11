'use client';

import PostCard from '@/components/ui/PostCard';
import { useEffect, useState } from 'react';

type Post = {
  id: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  created_at: string;
  read_time: number;
  type: 'article' | 'podcast' | 'video';
  author: { username: string; avatar_url?: string };
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockPosts: Post[] = [
      {
        id: '1',
        title: 'Как я перешёл на Next.js 15 и не пожалел',
        excerpt: 'Глубокий разбор нового App Router, Server Actions и почему это будущее веб-разработки...',
        cover_image: 'https://picsum.photos/id/1015/800/600',
        created_at: '2026-05-10T10:00:00Z',
        read_time: 12,
        type: 'article',
        author: { username: 'sonnet', avatar_url: 'https://i.pravatar.cc/128?u=sonnet' }
      },
    ];
    setPosts(mockPosts);
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <h1 className="text-6xl font-semibold tracking-tighter mb-4">
          Что сегодня в пульсе?
        </h1>
        <p className="text-xl text-zinc-400">Чистые мысли. Глубокий контент. Без шума.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}