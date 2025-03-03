'use client'

export default function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  return (
    <button
      onClick={onRefresh}
      className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200"
    >
      刷新
    </button>
  )
}
