import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui';
import { QueryProvider } from '@/providers';
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
  title: 'Weeth',
  description: '동아리는 우리 모두가 함께 하는 것! with, Weeth!',
  icons: {
    icon: '/assets/favicon/favicon.svg',
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
            __html: `(function(){try{var t=localStorage.getItem('weeth-theme');var isDark=t?JSON.parse(t).state.isDark:false;if(isDark)document.documentElement.classList.add('dark')}catch(e){}})()`,
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
        <QueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
      {isProduction && <GoogleAnalytics gaId="G-9RW2TCLMVF" />}
    </html>
  );
}
