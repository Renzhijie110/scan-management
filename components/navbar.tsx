'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo + 标题 */}
          <div className="flex items-center space-x-4">
            <Logo />
            <span className="hidden sm:inline text-xl font-semibold text-gray-800">
              
              Pallet Tracking System
            </span>
          </div>

          {/* 桌面导航 */}
          <div className="hidden sm:flex sm:space-x-8">
            <NavLink href="/create-qrcode" currentPath={pathname} label="Generate QR Code" />
            <NavLink href="/scan" currentPath={pathname} label="Scan" />  
            <NavLink href="/dashboard" currentPath={pathname} label="Dashboard" />
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="hidden sm:inline bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
            >
              Home
            </button>

            {/* 手机汉堡菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 手机菜单展开 */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
          <NavLink href="/scan" currentPath={pathname} label="Scan" />  
          <button
            onClick={handleLogout}
            className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
          >
            Home
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  currentPath,
  label,
  mobile = false,
}: {
  href: string;
  currentPath: string;
  label: string;
  mobile?: boolean;
}) {
  const isActive = currentPath === href;

  const baseClasses = mobile
    ? 'block px-3 py-2 rounded-md text-base font-medium transition'
    : 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition';

  const activeClasses = mobile
    ? 'bg-blue-100 text-blue-700'
    : 'border-blue-500 text-gray-900';

  const inactiveClasses = mobile
    ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={() => {
        if (mobile) {
          // 这里可以关闭菜单逻辑
          // 例如调用父组件传的关闭函数（需提升状态）
        }
      }}
    >
      {label}
    </Link>
  );
}
