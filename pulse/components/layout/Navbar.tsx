'use client';

import Link from 'next/link';
import { Plus, User, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-tighter">
            puls
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Лента</Link>
            <Link href="/podcasts" className="hover:text-white transition-colors">Подкасты</Link>
            <Link href="/articles" className="hover:text-white transition-colors">Статьи</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full bg-zinc-900 border border-white/10 rounded-full pl-10 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <Link
            href="/create"
            className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Создать
          </Link>

          <Link href="/profile" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}