import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui';
import { QueryProvider } from '@/providers';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { cn } from '@/lib/cn';
import { TooltipProvider } from '@/components/ui';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
      </head>
      <body className={cn(inter.variable, 'w-full antialiased')} suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
