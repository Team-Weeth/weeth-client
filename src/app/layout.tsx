import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui';
import { QueryProvider, MSWProvider } from '@/providers';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { cn } from '@/lib/cn';
import { TooltipProvider } from '@/components/ui';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.weeth.kr'),
  title: '우리 동아리만의 사이트를 원한다면, 위드',
  description:
    '동아리의 출석부터 활동 공유까지! 위드에서 동아리만의 사이트를 개설하여 관리해보세요.',
  icons: {
    icon: '/assets/favicon/favicon.svg',
  },
  openGraph: {
    title: '우리 동아리만의 사이트를 원한다면, 위드',
    description:
      '동아리의 출석부터 활동 공유까지! 위드에서 동아리만의 사이트를 개설하여 관리해보세요.',
    images: [
      {
        url: '/assets/og/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Weeth',
      },
    ],
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '우리 동아리만의 사이트를 원한다면, 위드',
    description:
      '동아리의 출석부터 활동 공유까지! 위드에서 동아리만의 사이트를 개설하여 관리해보세요.',
    images: ['/assets/og/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var isLanding=/^\\/landing(?:\\/|$)/.test(location.pathname);if(isLanding){document.documentElement.classList.remove('dark');return;}var t=localStorage.getItem('weeth-theme');var mode='auto';if(t){var parsed=JSON.parse(t);var state=parsed&&parsed.state?parsed.state:{};mode=state.mode||'auto';}var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var shouldDark=mode==='auto'?prefersDark:mode==='dark';document.documentElement.classList.toggle('dark',shouldDark);}catch(e){}})()`,
          }}
        />
        {isProduction && (
          <>
            {/* Google Tag Manager */}
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MWBK5ZKS');`,
              }}
            />
            {/* Microsoft Clarity */}
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","w4xcdiytv2");`,
              }}
            />
          </>
        )}
      </head>
      <body className={cn(inter.variable, 'w-full antialiased')}>
        {isProduction && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-MWBK5ZKS"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <MSWProvider>
          <QueryProvider>
            <ThemeProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </QueryProvider>
        </MSWProvider>
      </body>
      {isProduction && <GoogleAnalytics gaId="G-9RW2TCLMVF" />}
    </html>
  );
}
