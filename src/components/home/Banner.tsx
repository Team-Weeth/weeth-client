import Image from 'next/image';
import MockBanner from '@/assets/image/mock-banner.png';

export function Banner() {
  return <Image src={MockBanner} alt="banner" width={1440} height={364} />;
}
