'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import NavWrapper from '@/components/nav-wrapper';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <NavWrapper />
        {children}
      </body>
    </html>
  );
}
