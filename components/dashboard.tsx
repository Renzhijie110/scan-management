'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any[]>([]);
  const [filteredDashboard, setFilteredDashboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<{ date: string; note: string } | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
        setFilteredDashboard(data);
      } else {
        setError('获取数据失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (date: string, note: string) => {
    try {
      const response = await fetch(`/api/dashboard/${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({date, note }),
      });
  
      if (response.ok) {
        setDashboard(prev => 
          prev.map(item => (item.date === date ? { ...item, note } : item))
        );
        setFilteredDashboard(prev => 
          prev.map(item => (item.date === date ? { ...item, note } : item))
        );
        setEditingNote(null);
      } else {
        setError("更新失败");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      setError("网络错误，请稍后重试");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-center p-6 text-lg">加载中...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-500">
        <p>{error}</p>
        <button onClick={fetchDashboard} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          重试
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white p-8 shadow-lg rounded-lg max-w-6xl mx-auto w-full">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Dashboard</h2>
      <div className="divide-y divide-gray-300">
        {filteredDashboard.map((item) => {
          const isMismatch = item.note && Number(item.sorting_count) !== Number(item.note);

          return (
            <div key={`${item.date}-${item.orig_warehouse}`} className="py-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl font-semibold text-gray-800">{item.date}</p>
                <div className="grid grid-cols-6 gap-6 text-right">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Orig Warehouse</p>
                    <p className="text-lg font-semibold text-gray-700">{item.orig_warehouse}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dest Warehouse</p>
                    <p className="text-lg font-semibold text-gray-700">{item.dest_warehouse}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sorting Scanned</p>
                    <p className={`text-lg font-semibold ${isMismatch ? 'text-red-500' : 'text-gray-700'}`}>
                      {item.sorting_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Driver Scanned</p>
                    <p className="text-lg font-semibold text-gray-700">{item.driver_count}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-full">
                      <p className="text-sm font-medium text-gray-500">Actual Pallet</p>
                      {editingNote?.date === item.date ? (
                        <input
                          type="text"
                          value={editingNote?.note ?? ''}
                          onChange={(e) => {
                            if (editingNote) {
                              setEditingNote({ ...editingNote, note: e.target.value });
                            }
                          }}
                          onBlur={() => {
                            if (editingNote) {
                              updateNote(item.date, editingNote.note);
                            }
                          }}
                          className={`text-lg border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            isMismatch ? 'text-red-500' : 'text-gray-700'
                          }`}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-lg cursor-pointer hover:text-blue-600 transition ${
                            isMismatch ? 'text-red-500' : 'text-gray-700'
                          }`}
                          onClick={() => setEditingNote({ date: item.date, note: item.note })}
                        >
                          {item.note || 'Click to Edit'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  

}
