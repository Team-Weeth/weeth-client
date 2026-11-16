import type { Metadata } from 'next';
import { ThemeModePageContent } from '@/components/mypage/ThemeModePageContent';

export const metadata: Metadata = { title: '테마 설정' };
export const dynamic = 'force-dynamic';

export default function ThemeModePage() {
  return <ThemeModePageContent />;
}
