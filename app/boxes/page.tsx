'use client'
import Table from '@/components/table';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Boxes() {
  const router = useRouter();
  useEffect(() => {
    const warehouse = localStorage.getItem('warehouse');
    if (warehouse !== 'JFK' && warehouse !== 'EWR') {
      router.push('/'); // 强制跳转回登录页
  }

  }, []);


  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto py-10">
        <Table />
      </div>
    </main>
  );
}
