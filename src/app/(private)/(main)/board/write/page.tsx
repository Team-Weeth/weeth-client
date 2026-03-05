import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/board/Editor'), { ssr: false });

export default function WritePage() {
  return (
    <main className="w-full">
      <Editor />
    </main>
  );
}
