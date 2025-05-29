'use client'
import Table from '@/components/table';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Boxes() {
  const router = useRouter();


  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto py-10">
        <Table />
      </div>
    </main>
  );
}
