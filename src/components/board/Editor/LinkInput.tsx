'use client';

import { useState } from 'react';
import { Editor as TiptapEditor } from '@tiptap/core';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui';
import { useClickOutside } from '@/hooks/useClickOutside';

interface LinkInputProps {
  editor: TiptapEditor;
  onClose: () => void;
}

function LinkInput({ editor, onClose }: LinkInputProps) {
  const attrs = editor.getAttributes('link');
  const [url, setUrl] = useState(() => (attrs.href as string) ?? '');

  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, '');
  const [title, setTitle] = useState(selectedText);

  const applyLink = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const { empty } = editor.state.selection;
    if (empty) {
      const linkText = title.trim() || trimmed;
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          marks: [{ type: 'link', attrs: { href: trimmed } }],
          text: linkText,
        })
        .run();
    } else {
      if (title.trim() && title !== selectedText) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .insertContent({
            type: 'text',
            marks: [{ type: 'link', attrs: { href: trimmed } }],
            text: title.trim(),
          })
          .run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
      }
    }
    onClose();
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyLink();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const isEditing = editor.isActive('link');

  const handleClickOutside = () => {
    if (url.trim()) {
      applyLink();
    } else {
      onClose();
    }
  };

  const popupRef = useClickOutside<HTMLDivElement>(handleClickOutside);

  return (
    <div
      ref={popupRef}
      className="border-line bg-container-neutral flex w-64 flex-col rounded-md border shadow-lg"
      onMouseDown={(e) => {
        // input/button 클릭 시에는 기본 포커스 동작 허용
        const target = e.target as HTMLElement;
        if (target.closest('input, button')) return;
        e.preventDefault();
      }}
    >
      <div className="flex flex-col gap-200 p-300">
        <div>
          <p className="typo-caption2 text-text-alternative mb-100">페이지 또는 URL</p>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="URL을 입력하세요"
            className="typo-caption2"
            autoFocus
          />
        </div>
        <div>
          <p className="typo-caption2 text-text-alternative mb-100">링크 제목</p>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="제목을 입력하세요"
            className="typo-caption2"
          />
        </div>
      </div>

      {isEditing && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            removeLink();
          }}
          className={cn(
            'border-line flex w-full items-center gap-200 border-t px-300 py-200',
            'typo-caption2 text-state-error hover:bg-container-neutral-interaction transition-colors',
          )}
        >
          <Trash2 size={12} />
          링크 제거
        </button>
      )}
    </div>
  );
}

export { LinkInput };
