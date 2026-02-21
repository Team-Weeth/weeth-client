'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/board/Editor'), { ssr: false });

export default function BoardPage() {
  return (
    <main className="mx-auto max-w-3xl p-700">
      <Editor />
    </main>
  );
}
