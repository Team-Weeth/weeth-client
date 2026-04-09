'use client';

import { TitleInput } from './TitleInput';
import { usePostStore } from '@/stores/usePostStore';

/**
 * PostStore에 바인딩된 TitleInput
 */
function BoundTitleInput() {
  const title = usePostStore((s) => s.title);
  const setTitle = usePostStore((s) => s.setTitle);
  return <TitleInput value={title} onChange={(e) => setTitle(e.target.value)} />;
}

export { BoundTitleInput };
