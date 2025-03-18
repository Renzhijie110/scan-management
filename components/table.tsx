'use client';

import { useState, useEffect } from 'react';

export default function Table() {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [filteredBoxes, setFilteredBoxes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoxes, setSelectedBoxes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items per page

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
        setError('Failed to fetch data');
      }
    } catch (error) {
      setError('Network error, please try again later');
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
    setCurrentPage(1); // Reset to first page when searching
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
    if (selectedBoxes.size === currentItems.length) {
      setSelectedBoxes(new Set());
    } else {
      setSelectedBoxes(new Set(currentItems.map(box => box.box_id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBoxes.size === 0 || !confirm('Are you sure you want to delete the selected items?')) {
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
        setError('Failed to delete');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Delete failed, please try again later');
    }
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBoxes.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
        <button onClick={fetchBoxes} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/50 p-8 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Item List</h2>
          <p className="text-sm text-gray-500">Total: {filteredBoxes.length}</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search BOX ID"
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
        {selectedBoxes.size === currentItems.length ? 'Deselect All' : 'Select All'}
      </button>
      <button
        onClick={handleDeleteSelected}
        className="ml-4 mb-4 px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-200"
      >
        Delete Selected
      </button>
      
      <div className="divide-y divide-gray-900/5">
        {currentItems.map((box) => (
          <div key={`${box.box_id}-${box.user_id}`} className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-5">
              <input
                type="checkbox"
                checked={selectedBoxes.has(box.box_id)}
                onChange={() => toggleSelectBox(box.box_id)}
              />
              <p className="font-medium">BOX ID: {box.box_id}</p>
            </div>
            <div className="flex items-center space-x-10">
              <div className="text-right min-w-[220px]">
                <p className="text-sm font-medium text-gray-500">Sorting Scan Time</p>
                <p className="text-sm text-gray-500">{box.sorting_time ? new Date(box.sorting_time).toLocaleString() : 'Unscanned'}</p>
              </div>
              <div className="text-right min-w-[220px]">
                <p className="text-sm font-medium text-gray-500">Driver Scan Time</p>
                <p className="text-sm text-gray-500">{box.driver_time ? new Date(box.driver_time).toLocaleString() : 'Unscanned'}</p>
              </div>
              <div className="text-right min-w-[220px]">
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm text-gray-500">{box.created_at ? new Date(box.created_at).toLocaleString() : 'Unscanned'}</p>
              </div>
              <div className="text-right min-w-[150px]">
                <p className="text-sm font-medium text-gray-500">Sorting Warehouse</p>
                <p className="text-sm text-gray-500">{box.warehouse}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
            {/* 分页控制 */}
            <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
    
  );
}

