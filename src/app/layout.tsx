import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers';
import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipProvider } from '@/components/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Weeth',
  description: '동아리는 우리 모두가 함께 하는 것! with, Weeth!',
  icons: {
    icon: '/icons/favicon/favicon.svg',
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
            __html: `(function(){try{var t=localStorage.getItem('weeth-theme');var isDark=t?JSON.parse(t).state.isDark:true;if(isDark)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="w-full antialiased">
        <QueryProvider>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
