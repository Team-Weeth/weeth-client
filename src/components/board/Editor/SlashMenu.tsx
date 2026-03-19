'use client';

import { Editor as TiptapEditor } from '@tiptap/core';
import { cn } from '@/lib/cn';
import { MenuItem } from '@/types/editor';
import { useSlashMenu } from './useSlashMenu';

interface SlashMenuContentProps {
  editor: TiptapEditor;
  onClose: () => void;
  extraGroups?: { title: string; items: MenuItem[] }[];
}

export function SlashMenuContent({ editor, onClose, extraGroups = [] }: SlashMenuContentProps) {
  const { menuRef, filteredGroups, flatItems, selectedIndex, setSelectedIndex, handleSelect } =
    useSlashMenu(editor, onClose, extraGroups);

  if (flatItems.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="scrollbar-custom border-line bg-container-neutral max-h-[min(400px,calc(100dvh-64px))] w-64 overflow-y-auto rounded-md border py-1 shadow-xl"
    >
      {filteredGroups.map((group, groupIdx) => (
        <div key={group.title}>
          <div className={cn('px-300 pt-200 pb-100', groupIdx !== 0 && 'border-line border-t')}>
            <p className="typo-caption1 text-text-disabled tracking-wider uppercase">
              {group.title}
            </p>
          </div>

          {group.items.map((item, itemIdx) => {
            const flatIndex = group.offset + itemIdx;
            const isSelected = flatIndex === selectedIndex;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                data-index={flatIndex}
                onMouseEnter={() => setSelectedIndex(flatIndex)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(item);
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-300 px-300 py-200 text-left transition-colors',
                  'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
                  isSelected && 'bg-container-neutral-interaction',
                )}
              >
                <span
                  className="text-text-alternative flex shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  <Icon size={15} />
                </span>
                <span className="typo-body2 text-text-strong">{item.label}</span>
                {item.description && (
                  <span className="typo-caption2 text-text-disabled ml-auto">{item.description}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
