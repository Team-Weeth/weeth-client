import type { Metadata } from 'next';
import { ClubWelcomePage } from '@/components/auth/hub/ClubWelcomePage';

export const metadata: Metadata = { title: '환영합니다' };

export default function WelcomePage() {
  return <ClubWelcomePage />;
}
