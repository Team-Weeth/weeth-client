'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/cn';
import { useLineClamp } from '@/hooks/useLineClamp';
import { readOnlyExtensions } from '@/components/board/Editor/extensions';

import { ExpandButton } from './ExpandButton';

interface PostCardBodyProps {
  className?: string;
  content: string;
  expandable?: boolean;
}

function PostCardBody({ className, content, expandable = false }: PostCardBodyProps) {
  const sanitized = DOMPurify.sanitize(content, {
    ADD_TAGS: ['figure'],
    ADD_ATTR: [
      'target',
      'rel',
      'colwidth',
      'data-file-attachment',
      'data-src',
      'data-file-name',
      'data-file-size',
      'data-content-type',
      'data-text-align',
      'data-image-group',
    ],
  });

  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLDivElement>(
    expandable,
    sanitized,
  );

  const editor = useEditor({
    extensions: readOnlyExtensions,
    content: sanitized,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose-readonly text-text-normal typo-body1 self-stretch whitespace-pre-line',
          className ?? '',
        ),
      },
    },
  });

  // content prop이 바뀔 때(React Query 갱신 등) 에디터 내용 동기화
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(sanitized);
  }, [editor, sanitized]);

  return (
    <>
      <div
        ref={ref}
        className={cn('self-stretch', expandable && !isExpanded && 'line-clamp-8 overflow-hidden')}
      >
        <EditorContent editor={editor} className="w-full max-w-[900px]" />
      </div>
      {expandable && isClamped && !isExpanded && (
        <ExpandButton onExpand={() => setIsExpanded(true)} />
      )}
    </>
  );
}

export { PostCardBody, type PostCardBodyProps };
