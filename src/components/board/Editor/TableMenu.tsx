'use client';

import { RefObject } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Editor as TiptapEditor } from '@tiptap/core';
import { CellSelection } from '@tiptap/pm/tables';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { TABLE_MENU_GROUPS } from '@/constants/board/tableMenu';

const ICON_SIZE = 15;

interface TableMenuProps {
  editor: TiptapEditor;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function TableMenu({ editor, containerRef }: TableMenuProps) {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top-start',
        appendTo: () => containerRef.current ?? document.body,
      }}
      shouldShow={({ editor: e }) => {
        if (!e.isActive('table')) return false;
        return e.state.selection instanceof CellSelection;
      }}
      className="border-line bg-container-neutral flex items-center rounded-md border p-100 shadow-md"
    >
      <TooltipProvider>
        {TABLE_MENU_GROUPS.map((group, groupIndex) => (
          <div key={group.title} className="flex items-center">
            {groupIndex > 0 && <div className="bg-line mx-100 h-4 w-px" />}
            {group.items.map(({ label, icon: Icon, command, destructive }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={label}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      command(editor);
                    }}
                    className={cn(
                      'rounded px-200 py-100 transition-colors',
                      destructive
                        ? 'text-state-error hover:bg-container-neutral-interaction'
                        : 'text-icon-alternative hover:bg-container-neutral-interaction',
                    )}
                  >
                    <Icon size={ICON_SIZE} />
                  </button>
                </TooltipTrigger>
                <TooltipContent variant="sm">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </TooltipProvider>
    </BubbleMenu>
  );
}
