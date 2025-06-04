'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any[]>([]);
  const [filteredDashboard, setFilteredDashboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<{ id: number; comment: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [unscannedDetail, setUnscannedDetail] = useState<any[] | null>(null);
  const [unscannedLoading, setUnscannedLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [searchStartWarehouse, setSearchStartWarehouse] = useState('');
  const [searchDestWarehouse, setSearchDestWarehouse] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboard()
  }, []);
  const handleUnscannedClick = async (date: string, start_warehouse: string, destination_warehouse: string) => {
    setUnscannedLoading(true);
    setShowDetailModal(true);
    try {
      const res = await fetch(`/api/unscannedDetail?date=${date}&start_warehouse=${start_warehouse}&destination_warehouse=${destination_warehouse}`);
      const data = await res.json();
      setUnscannedDetail(data.boxes);
    } catch (e) {
      alert('加载未扫详情失败');
      setUnscannedDetail(null);
    } finally {
      setUnscannedLoading(false);
    }
  };
  const handleScannedClick = async (date: string, start_warehouse: string, destination_warehouse: string) => {
    setUnscannedLoading(true);
    setShowDetailModal(true);
    try {
      const res = await fetch(`/api/scannedDetail?date=${date}&start_warehouse=${start_warehouse}&destination_warehouse=${destination_warehouse}`);
      const data = await res.json();
      setUnscannedDetail(data.boxes);
    } catch (e) {
      alert('加载未扫详情失败');
      setUnscannedDetail(null);
    } finally {
      setUnscannedLoading(false);
    }
  };
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard`);
      const data = await response.json();
      setDashboard(data);
      setFilteredDashboard(data);
    } catch (e) {
      setError('加载失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const filteredBySearch = filteredDashboard.filter((item) => {
    const dateMatch = item.date?.toLowerCase().includes(filterDate.toLowerCase());
    const startMatch = item.start_warehouse?.toString().toLowerCase().includes(searchStartWarehouse.toLowerCase());
    const destMatch = item.destination_warehouse?.toString().toLowerCase().includes(searchDestWarehouse.toLowerCase());
    return dateMatch && startMatch && destMatch;
  });
  const pagedData = filteredBySearch.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  
  const totalPages = Math.ceil(filteredBySearch.length / itemsPerPage);

  const startEdit = (row: any) => {
    const index = dashboard.findIndex(item =>
      item.date === row.date &&
      item.start_warehouse === row.start_warehouse &&
      item.destination_warehouse === row.destination_warehouse
    );
    setEditingNote({ id: index, comment: dashboard[index]?.comment || '' });
  };

  const saveEdit = async () => {
    if (editingNote) {
      try {
        const { id, comment } = editingNote;
        const item = dashboard[id];
        const res = await fetch(`/api/editNote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item,comment }),
        });
        if (!res.ok) throw new Error('更新失败');
  
        // 本地更新
        const newData = [...dashboard];
        newData[id].comment = comment;
        setDashboard(newData);
        setFilteredDashboard(newData);
        setEditingNote(null);
      } catch (err) {
        alert('保存失败，请稍后重试');
      }
    }
  };


  return (
    <div style={styles.container}>
      {loading && <p style={styles.tip}>加载中...</p>}
      {error && <p style={{ ...styles.tip, color: 'crimson' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={styles.card}>
          <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="搜索日期(YYYYMMDD)"
              className="w-60 px-5 py-3 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-sm transition-all duration-200"
              pattern="\d{8}"
            />
            <input
              type="text"
              placeholder="搜索起始仓"
              value={searchStartWarehouse}
              onChange={(e) => setSearchStartWarehouse(e.target.value)}
              className="w-60 px-5 py-3 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-sm transition-all duration-200"
            />
            <input
              type="text"
              placeholder="搜索目的仓"
              value={searchDestWarehouse}
              onChange={(e) => setSearchDestWarehouse(e.target.value)}
              className="w-60 px-5 py-3 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-sm transition-all duration-200"
            />
          </div>

            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  {['日期', '起始仓', '目的仓', '总板数', '已扫', '未扫', '备注', '操作'].map((head) => (
                    <th key={head} style={styles.th}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedData.map((row, idx) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                  return (
                    <tr key={globalIndex} style={styles.tr}>
                      <td style={styles.td}>{row.date}</td>
                      <td style={styles.td}>{row.start_warehouse}</td>
                      <td style={styles.td}>{row.destination_warehouse}</td>
                      <td style={styles.tdRight}>{row.total_pallet_count}</td>
                      <td style={{ ...styles.tdRight, color: '#409eff', cursor: 'pointer' }}
                          onClick={() => handleScannedClick(row.date,row.start_warehouse,row.destination_warehouse)}>
                      {row.scan_pallet_count}</td>
                      <td style={{ ...styles.tdRight, color: '#409eff', cursor: 'pointer' }}
                          onClick={() => handleUnscannedClick(row.date,row.start_warehouse,row.destination_warehouse)}>
                        {row.unscanned_count}
                      </td>
                      <td style={styles.td}>
                      {editingNote && dashboard[editingNote.id]?.date === row.date &&
                        dashboard[editingNote.id]?.start_warehouse === row.start_warehouse &&
                        dashboard[editingNote.id]?.destination_warehouse === row.destination_warehouse ? (
                            <input
                              value={editingNote.comment}
                              onChange={(e) =>
                                setEditingNote({ ...editingNote, comment: e.target.value })
                              }
                              style={styles.input}
                            />
                        ) : (
                          row.comment || ''
                        )}
                      </td>
                      <td style={styles.td}>
                      {editingNote &&
                        dashboard[editingNote.id]?.date === row.date &&
                        dashboard[editingNote.id]?.start_warehouse === row.start_warehouse &&
                        dashboard[editingNote.id]?.destination_warehouse === row.destination_warehouse ? (
                          <>
                            <button style={styles.btnPrimary} onClick={saveEdit}>保存</button>
                            <button style={styles.btnGray} onClick={() => setEditingNote(null)}>取消</button>
                          </>
                      ) : (
                          <button style={styles.btnSoft} onClick={() => startEdit(row)}>编辑</button>
                      )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <button
              style={currentPage === 1 ? styles.pageDisabled : styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <span style={styles.pageText}>第 {currentPage} / {totalPages} 页</span>
            <button
              style={currentPage === totalPages ? styles.pageDisabled : styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </button>
          </div>
        </>
      )}
      {showDetailModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>扫描详情</h3>
            {unscannedLoading ? (
              <p>加载中...</p>
            ) : unscannedDetail ? (
              <ul style={styles.detailList}>
                {unscannedDetail.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '12px' }}>
                    <strong>时间:</strong> {item.date}<br />
                    <strong>起始仓:</strong> {item.start_warehouse} ➡
                    <strong>目的仓:</strong> {item.destination_warehouse}<br />
                    <strong>箱号:</strong> {item.box_id}<br />                    
                    <strong>扫描时间:</strong> {item.scan_time ? new Date(item.scan_time).toLocaleString() : 'N/A'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>暂无数据</p>
            )}
            <button style={styles.btnPrimary} onClick={() => setShowDetailModal(false)}>关闭</button>
          </div>
        </div>
      )}
    </div>
    
  );
  
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: `'Noto Sans SC', sans-serif`,
    backgroundColor: '#f9fafb',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    color: '#333',
    marginBottom: 24,
  },
  tip: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
  },
  table: {
    width: '100%',
    tableLayout: 'fixed', // 强制每列平分
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  tableHead: {
    backgroundColor: '#f0f4f8',
  },
  th: {
    textAlign: 'left',
    padding: '10px 16px', // 与 td 一致
    fontWeight: 500,
    fontSize: 14,
    color: '#555',
    borderBottom: '1px solid #e0e6ed',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 16px',
    fontSize: 14,
    color: '#333',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },

  tdRight: {
    padding: '10px 16px',
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  input: {
    width: '100%',
    padding: '6px 8px',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #d0d5dd',
    backgroundColor: '#fff',
  },
  btnPrimary: {
    backgroundColor: '#409eff',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    marginRight: 8,
    cursor: 'pointer',
  },
  btnGray: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  btnSoft: {
    backgroundColor: '#eef3f8',
    color: '#336699',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  pagination: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: '#409eff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  pageDisabled: {
    padding: '8px 16px',
    backgroundColor: '#e0e0e0',
    color: '#aaa',
    border: 'none',
    borderRadius: 6,
    cursor: 'not-allowed',
  },
  pageText: {
    color: '#666',
    fontSize: 14,
  },
};
