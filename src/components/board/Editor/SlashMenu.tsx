'use client';

import { Editor as TiptapEditor } from '@tiptap/core';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { STYLE_ITEMS, INSERT_ITEMS } from '@/constants/editor';
import { MenuItem } from '@/types/editor';

interface SlashMenuContentProps {
  editor: TiptapEditor;
  onClose: () => void;
}

/**
 * Slash Command 메뉴 UI
 *
 * 역할:
 * - '/' 입력 후 나타나는 커맨드 목록 렌더링
 * - 키보드 탐색 (↑ ↓ Enter Escape)
 * - 선택 시 slash 문자 제거 후 해당 command 실행
 */

export function SlashMenuContent({ editor, onClose }: SlashMenuContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  /**
   * 그룹 구조 정의
   */
  const GROUPS = useMemo(
    () => [
      { title: 'Style', items: STYLE_ITEMS },
      { title: 'Insert', items: INSERT_ITEMS },
    ],
    [],
  );

  const flatItems = useMemo(() => GROUPS.flatMap((group) => group.items), [GROUPS]);

  useEffect(() => {
    if (flatItems.length === 0) {
      setSelectedIndex(0);
      return;
    }

    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(0);
    }
  }, [flatItems.length, selectedIndex]);

  // 메뉴 선택 시 실행
  const handleSelect = useCallback(
    (item: MenuItem) => {
      const { $anchor } = editor.state.selection;

      const from = $anchor.pos - 1;
      const to = $anchor.pos;

      editor.chain().focus().deleteRange({ from, to }).run();
      item.command(editor);
      onClose();
    },
    [editor, onClose],
  );

  // 키보드 이벤트 핸들링
  useEffect(() => {
    if (flatItems.length === 0) return;

    const dom = editor.view.dom;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const item = flatItems[selectedIndex];
        if (item) handleSelect(item);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    dom.addEventListener('keydown', handleKeyDown);
    return () => dom.removeEventListener('keydown', handleKeyDown);
  }, [editor, flatItems, selectedIndex, handleSelect, onClose]);

  if (flatItems.length === 0) return null;

  let runningIndex = 0;
  const currentIndex = runningIndex++;

  return (
    <div className="w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="max-h-80 overflow-x-hidden overflow-y-auto">
        {GROUPS.map((group, groupIdx) => (
          <div key={group.title}>
            <div className={`px-3 pt-2 pb-1 ${groupIdx !== 0 ? 'border-t border-gray-100' : ''}`}>
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                {group.title}
              </p>
            </div>

            {group.items.map((item) => {
              const currentIndex = runningIndex++;
              const isSelected = currentIndex === selectedIndex;

              return (
                <button
                  key={item.label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                    isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        <div className="pb-1" />
      </div>
    </div>
  );
}
