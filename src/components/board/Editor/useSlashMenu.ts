import { Editor as TiptapEditor } from '@tiptap/core';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { STYLE_ITEMS } from '@/constants/editor';
import { MenuItem } from '@/types/editor';

const DEFAULT_GROUPS = [{ title: '기본 블록', items: STYLE_ITEMS }];

function getSlashQuery(editor: TiptapEditor): string {
  const { $anchor } = editor.state.selection;
  const text = $anchor.nodeBefore?.textContent ?? '';
  const slashIdx = text.lastIndexOf('/');
  if (slashIdx === -1) return '';
  return text.slice(slashIdx + 1);
}

export function useSlashMenu(
  editor: TiptapEditor,
  onClose: () => void,
  extraGroups: { title: string; items: MenuItem[] }[] = [],
) {
  const allGroups = useMemo(() => [...DEFAULT_GROUPS, ...extraGroups], [extraGroups]);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prevQueryRef = useRef(query);

  // 에디터 변경 시 쿼리 업데이트 + 쿼리 변경 시 선택 인덱스 리셋
  useEffect(() => {
    const updateQuery = () => {
      const next = getSlashQuery(editor);
      setQuery(next);
      if (next !== prevQueryRef.current) {
        setSelectedIndex(0);
        prevQueryRef.current = next;
      }
    };
    updateQuery();
    editor.on('update', updateQuery);
    return () => {
      editor.off('update', updateQuery);
    };
  }, [editor]);

  // 쿼리로 필터링된 그룹 + 각 그룹의 flat offset 계산
  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    const { groups } = allGroups.reduce<{
      groups: { title: string; items: MenuItem[]; offset: number }[];
      offset: number;
    }>(
      (acc, group) => {
        const items = group.items.filter((item) =>
          item.label.toLowerCase().includes(normalizedQuery),
        );
        if (items.length > 0) {
          acc.groups.push({ title: group.title, items, offset: acc.offset });
          acc.offset += items.length;
        }
        return acc;
      },
      { groups: [], offset: 0 },
    );
    return groups;
  }, [allGroups, query]);

  const flatItems = useMemo(() => filteredGroups.flatMap((group) => group.items), [filteredGroups]);

  const menuRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // 필터 결과 없으면 메뉴 닫기
  useEffect(() => {
    if (flatItems.length === 0 && query.length > 0) {
      onClose();
    }
  }, [flatItems.length, query, onClose]);

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // 메뉴 선택 시 실행 — slash + 쿼리 전체 삭제
  const handleSelect = useCallback(
    (item: MenuItem) => {
      const { $anchor } = editor.state.selection;
      const currentQuery = getSlashQuery(editor);
      const from = $anchor.pos - currentQuery.length - 1; // '/' + query
      const to = $anchor.pos;

      editor.chain().focus().deleteRange({ from, to }).run();
      item.command(editor);
      onClose();
    },
    [editor, onClose],
  );

  // ref로 최신 값 추적 → 리스너 재등록 방지
  const selectedIndexRef = useRef(selectedIndex);
  const flatItemsRef = useRef(flatItems);
  const handleSelectRef = useRef(handleSelect);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    flatItemsRef.current = flatItems;
    handleSelectRef.current = handleSelect;
  }, [selectedIndex, flatItems, handleSelect]);

  // 키보드 이벤트 핸들링
  useEffect(() => {
    const dom = editor.view.dom;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = flatItemsRef.current;
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const item = items[selectedIndexRef.current];
        if (item) handleSelectRef.current(item);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    dom.addEventListener('keydown', handleKeyDown);
    return () => dom.removeEventListener('keydown', handleKeyDown);
  }, [editor, onClose]);

  return {
    menuRef,
    filteredGroups,
    flatItems,
    selectedIndex,
    setSelectedIndex,
    handleSelect,
  };
}
