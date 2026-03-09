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
      className="border-line bg-container-neutral max-h-[min(400px,calc(100dvh-64px))] w-64 overflow-hidden rounded-lg border shadow-xl"
    >
      <div className="scrollbar-custom max-h-[inherit] overflow-y-auto">
        {filteredGroups.map((group, groupIdx) => (
          <div key={group.title}>
            <div className={cn('px-3 pt-2 pb-1', groupIdx !== 0 && 'border-line border-t')}>
              <p className="text-text-disabled text-xs font-semibold tracking-wider uppercase">
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
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                    isSelected && 'bg-container-neutral-interaction',
                  )}
                >
                  <span className="text-text-alternative flex shrink-0 items-center justify-center">
                    <Icon size={16} />
                  </span>
                  <span className="text-text-strong text-sm font-medium">{item.label}</span>
                  {item.description && (
                    <span className="text-text-disabled ml-auto text-xs">{item.description}</span>
                  )}
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
