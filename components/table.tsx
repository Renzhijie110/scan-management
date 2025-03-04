'use client';

import { useState, useEffect } from 'react';


export default function Table() {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [filteredBoxes, setFilteredBoxes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoxes, setSelectedBoxes] = useState<Set<string>>(new Set());
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
        setFilteredBoxes(data);
        setSelectedBoxes(new Set());
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

  useEffect(() => {
    const filtered = boxes.filter(box => 
      box.box_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBoxes(filtered);
  }, [searchQuery, boxes]);

  const toggleSelectBox = (boxId: string) => {
    setSelectedBoxes(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(boxId)) {
        newSelection.delete(boxId);
      } else {
        newSelection.add(boxId);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectedBoxes.size === filteredBoxes.length) {
      setSelectedBoxes(new Set());
    } else {
      setSelectedBoxes(new Set(filteredBoxes.map(box => box.box_id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBoxes.size === 0 || !confirm('确定要删除选中的物品吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/boxes/delete-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ box_ids: Array.from(selectedBoxes) }),
      });

      if (response.ok) {
        setBoxes(boxes.filter(box => !selectedBoxes.has(box.box_id)));
        setSelectedBoxes(new Set());
      } else {
        setError('删除失败');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('删除失败，请稍后重试');
    }
  };

  if (loading) {
    return <div className="text-center p-4">加载中...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
        <button onClick={fetchBoxes} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">物品列表</h2>
          <p className="text-sm text-gray-500">共 {filteredBoxes.length} 个物品</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="搜索 BOX ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      <button
        onClick={toggleSelectAll}
        className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        {selectedBoxes.size === filteredBoxes.length ? '取消全选' : '全选'}
      </button>
      <button
        onClick={handleDeleteSelected}
        className="ml-4 mb-4 px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-200"
      >
        删除选中
      </button>
      <div className="divide-y divide-gray-900/5">
        {filteredBoxes.map((box) => (
          <div key={box.box_id} className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-5">
              <input
                type="checkbox"
                
                checked={selectedBoxes.has(box.box_id)}
                onChange={() => toggleSelectBox(box.box_id)}
              />
              <p className="font-medium">BOX ID: {box.box_id}</p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-right min-w-[180px]">
                <p className="text-sm font-medium text-gray-500">分拣扫描时间</p>
                <p className="text-sm text-gray-500">{box.sorting_time ? new Date(box.sorting_time).toLocaleString() : 'Unscanned'}</p>
              </div>
              <div className="text-right min-w-[180px]">
                <p className="text-sm font-medium text-gray-500">司机扫描时间</p>
                <p className="text-sm text-gray-500">{box.driver_time ? new Date(box.driver_time).toLocaleString() : 'Unscanned'}</p>
              </div>
              <div className="text-right min-w-[180px]">
                <p className="text-sm font-medium text-gray-500">创建时间</p>
                <p className="text-sm text-gray-500">{box.created_at ? new Date(box.created_at).toLocaleString() : 'Unscanned'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
