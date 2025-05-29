'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/dashboard';

export default function Boxes() {
  const router = useRouter();


  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto py-10">
            <Dashboard />
      </div>
    </main>
  );
}