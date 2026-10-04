'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Editor as TiptapEditor } from '@tiptap/core';
import { ImageIcon, Paperclip, Minus, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface BlockAddMenuProps {
  editor: TiptapEditor;
  containerRef: RefObject<HTMLDivElement | null>;
  onImageUpload: () => void;
  onFileUpload: () => void;
}

interface MenuItem {
  label: string;
  icon: LucideIcon;
  command: () => void;
}

interface ButtonPos {
  top: number;
  left: number;
}

function BlockAddMenu({ editor, containerRef, onImageUpload, onFileUpload }: BlockAddMenuProps) {
  const [buttonPos, setButtonPos] = useState<ButtonPos | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_ITEMS: MenuItem[] = [
    {
      label: '이미지 업로드',
      icon: ImageIcon,
      command: () => {
        onImageUpload();
        setMenuOpen(false);
      },
    },
    {
      label: '파일 업로드',
      icon: Paperclip,
      command: () => {
        onFileUpload();
        setMenuOpen(false);
      },
    },
    {
      label: '구분선',
      icon: Minus,
      command: () => {
        editor.chain().focus().setHorizontalRule().run();
        setMenuOpen(false);
      },
    },
  ];

  // ① 커서 위치 추적 — 에디터 이벤트 + 스크롤/리사이즈 대응
  useEffect(() => {
    const update = () => {
      if (!containerRef.current || window.innerWidth <= 1000) {
        setButtonPos(null);
        setMenuOpen(false);
        return;
      }

      const { selection } = editor.state;
      const { $from } = selection;

      const shouldShow =
        editor.isEditable &&
        selection.empty &&
        ($from.parent.type.name === 'paragraph' || $from.parent.type.name === 'heading') &&
        !editor.isActive('table') &&
        !editor.isActive('codeBlock') &&
        !editor.isActive('inlineImage') &&
        !editor.isActive('fileAttachment');

      if (!shouldShow) {
        setButtonPos(null);
        setMenuOpen(false);
        return;
      }

      const coords = editor.view.coordsAtPos(selection.from);
      const containerRect = containerRef.current.getBoundingClientRect();

      // 컨테이너 왼쪽 바깥: 버튼(26px) + 간격(6px) = 32px 앞에 배치
      // 라인 중앙 정렬: 라인 높이 중간에 버튼 세로 중앙 정렬
      const lineHeight = coords.bottom - coords.top;
      setButtonPos({
        top: coords.top + Math.round((lineHeight - 26) / 2),
        left: containerRect.left - 32,
      });
    };

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    editor.on('focus', update);
    editor.on('blur', update);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
      editor.off('focus', update);
      editor.off('blur', update);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [editor, containerRef]);

  // ② 메뉴 열린 상태에서 커서 이동 시 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    editor.on('selectionUpdate', close);
    return () => {
      editor.off('selectionUpdate', close);
    };
  }, [editor, menuOpen]);

  // ③ 메뉴 열린 상태에서 외부 포인터다운 시 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  if (!buttonPos) return null;

  return createPortal(
    <div className="fixed z-50" style={{ top: buttonPos.top, left: buttonPos.left }}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="블록 추가"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setMenuOpen((prev) => !prev)}
        className={cn(
          'border-line bg-container-neutral flex size-[26px] cursor-pointer items-center justify-center rounded-sm border transition-colors',
          'text-icon-normal hover:bg-container-neutral-interaction',
        )}
      >
        <Plus
          size={16}
          className={cn('transition-transform duration-200', menuOpen && 'rotate-45')}
        />
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          className="border-line bg-container-neutral absolute top-full left-0 z-50 mt-100 min-w-[160px] rounded-md border p-100 shadow-md"
        >
          {MENU_ITEMS.map(({ label, icon: Icon, command }) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={command}
              className="hover:bg-container-neutral-interaction typo-body2 text-text-normal flex w-full cursor-pointer items-center gap-200 rounded-sm px-200 py-200 transition-colors"
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

export { BlockAddMenu, type BlockAddMenuProps };
