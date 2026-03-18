'use client';

import { useState, useEffect, RefObject } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Editor as TiptapEditor } from '@tiptap/core';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { MARK_BUTTONS, HEADING_BUTTONS, BubbleMenuItem, BubbleActiveKey } from '@/constants/bubbleMenu';

const ICON_SIZE = 14;

const bubbleButtonVariants = cva('rounded px-200 py-100 transition-colors', {
  variants: {
    active: {
      true: 'text-brand-primary',
      false: 'text-icon-alternative hover:bg-container-neutral-interaction',
    },
  },
  defaultVariants: { active: false },
});

interface BubbleMenuBarProps {
  editor: TiptapEditor;
  containerRef: RefObject<HTMLDivElement | null>;
}

function getActiveStates(editor: TiptapEditor): Record<BubbleActiveKey, boolean> {
  const bold = editor.isActive('bold');
  const italic = editor.isActive('italic');
  const code = editor.isActive('code');

  const heading1 = editor.isActive('heading', { level: 1 });
  const heading2 = editor.isActive('heading', { level: 2 });
  const heading3 = editor.isActive('heading', { level: 3 });

  return {
    plainText: !bold && !italic && !code && !heading1 && !heading2 && !heading3,
    bold,
    italic,
    code,
    heading1,
    heading2,
    heading3,
  };
}

function useEditorActiveStates(editor: TiptapEditor): Record<BubbleActiveKey, boolean> {
  const [states, setStates] = useState(() => getActiveStates(editor));

  useEffect(() => {
    const handler = () => {
      const next = getActiveStates(editor);
      setStates((prev) => {
        if (
          prev.plainText === next.plainText &&
          prev.bold === next.bold &&
          prev.italic === next.italic &&
          prev.code === next.code &&
          prev.heading1 === next.heading1 &&
          prev.heading2 === next.heading2 &&
          prev.heading3 === next.heading3
        ) {
          return prev;
        }
        return next;
      });
    };
    editor.on('transaction', handler);
    return () => {
      editor.off('transaction', handler);
    };
  }, [editor]);

  return states;
}

function renderButtons(
  items: BubbleMenuItem[],
  editor: TiptapEditor,
  active: Record<BubbleActiveKey, boolean>,
) {
  return items.map(({ key, label, icon: Icon, command }) => (
    <button
      key={key}
      type="button"
      aria-label={label}
      onMouseDown={(e) => {
        e.preventDefault();
        command(editor);
      }}
      className={cn(bubbleButtonVariants({ active: active[key] }))}
    >
      <Icon size={ICON_SIZE} />
    </button>
  ));
}

export function BubbleMenuBar({ editor, containerRef }: BubbleMenuBarProps) {
  const active = useEditorActiveStates(editor);

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top-start',
        appendTo: () => containerRef.current ?? document.body,
      }}
      className="border-line bg-container-neutral flex items-center rounded-md border p-100 shadow-md"
    >
      {renderButtons(MARK_BUTTONS, editor, active)}
      <div className="bg-line mx-100 h-4 w-px" />
      {renderButtons(HEADING_BUTTONS, editor, active)}
    </BubbleMenu>
  );
}
