'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
