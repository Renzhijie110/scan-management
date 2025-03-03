'use client';

import { useState, useEffect } from 'react';
import RefreshButton from './refresh-button';

export default function Table() {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/boxes');
      if (response.ok) {
        const data = await response.json();
        setBoxes(data);
      } else {
        setError('获取数据失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleDelete = async (boxId: string) => {
    if (!confirm('确定要删除这个物品吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/boxes/${boxId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBoxes(boxes.filter(box => box.box_id !== boxId));
      } else {
        setError('删除失败');
      }
    } catch (error) {
      setError('删除失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full text-center py-4">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full">
        <div className="text-center py-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchBoxes}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">物品列表</h2>
          <p className="text-sm text-gray-500">
            共 {boxes.length} 个物品
          </p>
        </div>
        <RefreshButton onRefresh={fetchBoxes} />
      </div>
      <div className="divide-y divide-gray-900/5">
        {boxes.map((box) => (
          <div
            key={box.box_id}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <p className="font-medium leading-none">BOX ID: {box.box_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-right min-w-[180px]">
                <p className="text-sm font-medium text-gray-500">分拣扫描时间</p>
                <p className="text-sm text-gray-500">
                  {box.sorting_time ? new Date(box.sorting_time).toLocaleString() : 'Unscanned'}
                </p>
              </div>
              <div className="text-right min-w-[180px]">
                <p className="text-sm font-medium text-gray-500">司机扫描时间</p>
                <p className="text-sm text-gray-500">
                  {box.driver_time ? new Date(box.driver_time).toLocaleString() : 'Unscanned'}
                </p>
              </div>
              <div className="text-right min-w-[180px]">
                <p className="text-sm font-medium text-gray-500">创建时间</p>
                <p className="text-sm text-gray-500">
                  {box.created_at ? new Date(box.created_at).toLocaleString() : 'Unscanned'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(box.box_id)}
                className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
