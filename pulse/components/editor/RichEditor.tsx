'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Undo, Redo } from 'lucide-react';

interface RichEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichEditor({ content = '', onChange, onImageUpload }: RichEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Начни писать здесь... Твои мысли имеют значение.' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-8 py-6',
      },
    },
  });

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !onImageUpload) return;

      setIsUploading(true);
      try {
        const imageUrl = await onImageUpload(file);
        if (imageUrl && editor) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      } catch (error) {
        alert('Ошибка загрузки изображения');
      }
      setIsUploading(false);
    };
    
    input.click();
  }, [editor, onImageUpload]);

  if (!editor) return null;

  return (
    <div className="border border-white/10 rounded-3xl overflow-hidden bg-zinc-900">
      <div className="border-b border-white/10 bg-zinc-950 p-3 flex flex-wrap gap-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
          <Bold className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
          <Italic className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
          <Heading1 className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
          <Heading2 className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-white/10 mx-2 self-center" />

        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${editor.isActive('bulletList') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
          <List className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${editor.isActive('orderedList') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
          <ListOrdered className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${editor.isActive('blockquote') ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>
          <Quote className="w-5 h-5" />
        </button>

        <button onClick={addImage} disabled={isUploading} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-zinc-400 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {isUploading ? 'Загрузка...' : 'Изображение'}
        </button>

        <button onClick={() => {
          const url = window.prompt('URL ссылки:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-zinc-400">
          <LinkIcon className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        <button onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-zinc-400">
          <Undo className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-zinc-400">
          <Redo className="w-5 h-5" />
        </button>
      </div>

      <EditorContent editor={editor} className="min-h-[500px] bg-zinc-900" />
    </div>
  );
}