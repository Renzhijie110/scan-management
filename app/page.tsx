import { Suspense } from 'react';
import Table from '@/components/table';
import Link from 'next/link';

export const preferredRegion = 'home';
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <nav className="w-full bg-gray-800 p-4">
        <ul className="flex justify-center space-x-4">
          <li>
            <Link href="/" legacyBehavior>
              <a className="text-white">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/create-qrcode" legacyBehavior>
              <a className="text-white">CreateQRcode</a>
            </Link>
          </li>
          <li>
            <Link href="/scan-record" legacyBehavior>
              <a className="text-white">ScanRecord</a>
            </Link>
          </li>
          <li>
            <Link href="/settings" legacyBehavior>
              <a className="text-white">Settings</a>
            </Link>
          </li>
          <li>
            <Link href="/test-page" legacyBehavior>
              <a className="text-white">TestPage</a>
            </Link>
          </li>
        </ul>
      </nav>
      <h1 className="text-2xl font-bold">Boxes List</h1>
      <div className="container mx-auto py-10">
        <Suspense>
          <Table />
        </Suspense>
      </div>
    </main>
  );
}
