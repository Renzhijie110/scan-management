'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function NavWrapper() {
  const pathname = usePathname();
  const hideNavbar = pathname?.includes('/driver') || pathname?.includes('/sorting');

  return !hideNavbar ? <Navbar /> : null;
} 