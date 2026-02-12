import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
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
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('weeth-theme');var isDark=t?JSON.parse(t).state.isDark:true;if(isDark)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
