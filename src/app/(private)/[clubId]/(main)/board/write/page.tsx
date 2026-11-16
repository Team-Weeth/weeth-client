import type { Metadata } from 'next';
import ClientEditor from './ClientEditor';

export const metadata: Metadata = { title: '글 작성' };

export default function WritePage() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <ClientEditor />
    </main>
  );
}
