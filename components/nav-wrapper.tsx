'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function NavWrapper() {
  const pathname = usePathname();
  const hideNavbar = pathname?.includes('/track') || pathname === '/';

  return !hideNavbar ? <Navbar /> : null;
}
