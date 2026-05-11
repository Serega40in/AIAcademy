'use client';

import RichEditor from '@/components/editor/RichEditor';
import { useState } from 'react';

export default function CreatePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleImageUpload = async (file: File): Promise<string> => {
    // TODO: Implement Supabase upload
    return URL.createObjectURL(file); // temporary
  };

  const handlePublish = async () => {
    if (!title || !content) return alert('Заполни заголовок и контент');
    setIsPublishing(true);
    try {
      alert('Опубликовано! (Mock)');
      window.location.href = '/';
    } catch (err) {
      alert('Ошибка');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-12">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Заголовок публикации..."
        className="w-full text-5xl font-semibold bg-transparent border-none focus:outline-none placeholder-zinc-600 mb-10"
      />

      <RichEditor 
        content={content} 
        onChange={setContent}
        onImageUpload={handleImageUpload}
      />

      <div className="flex justify-end mt-8">
        <button
          onClick={handlePublish}
          disabled={isPublishing || !title || !content}
          className="bg-white text-black px-10 py-4 rounded-2xl font-medium text-lg hover:bg-white/90 disabled:opacity-50 transition-all"
        >
          {isPublishing ? 'Публикуем...' : 'Опубликовать в Puls'}
        </button>
      </div>
    </div>
  );
}