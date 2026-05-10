import { sanityClient } from '@/lib/sanity/client';

export interface PopupPage {
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  useDefaultImage?: boolean;
}

export interface PopupDocument {
  headerLabel?: string;
  pages: PopupPage[];
}

const QUERY = `*[_type == "popup" && isActive == true && (product == "all" || product == "weeth_v4") && (target == "all" || target == $currentEnv) && now() >= startDate && now() <= endDate] | order(startDate desc)[0] {
  headerLabel,
  pages[] {
    title,
    content,
    "imageUrl": image.asset->url,
    linkUrl,
    useDefaultImage
  }
}`;

export async function getActivePopup(): Promise<PopupDocument | null> {
  const currentEnv = process.env.NEXT_PUBLIC_API_URL?.includes('dev') ? 'dev' : 'production';
  return sanityClient.fetch(QUERY, { currentEnv }, { useCdn: false });
}
