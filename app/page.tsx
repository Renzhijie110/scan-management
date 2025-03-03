import { Suspense } from 'react'
import Table from '@/components/table'


export const preferredRegion = 'home'
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100">
      
        <h1 className="text-2xl font-bold">Boxes</h1>
        <button className="absolute top-5 right-5 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl">+</button>
        <div className="container mx-auto py-10">
          <Suspense>
            <Table />
          </Suspense>
        </div>
    </main>
  )
}
