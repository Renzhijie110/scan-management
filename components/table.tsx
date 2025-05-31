'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any[]>([]);
  const [filteredDashboard, setFilteredDashboard] = useState<any[]>([]); // 这一行是对的
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [datePickerValue, setDatePickerValue] = useState(''); // YYYY-MM-DD格式
  const [dateInput, setDateInput] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const formattedPickerDate = `${yyyy}-${mm}-${dd}`;
    const formattedDateInput = `${yyyy}${mm}${dd}`;
    setDatePickerValue(formattedPickerDate);
    setDateInput(formattedDateInput);
    fetchDashboard(formattedDateInput); // ✅ 初始化加载
  }, []);
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // 格式 YYYY-MM-DD
    setDatePickerValue(val);
    if (!val) {
      setDateInput('');
      return;
    }
    const [yyyy, mm, dd] = val.split('-');
    const yyyymmdd = `${yyyy}${mm}${dd}`;
    setDateInput(yyyymmdd);
    fetchDashboard(yyyymmdd); // ✅ 直接用新值
  };
  const fetchDashboard = async (yyyymmdd = '') => {
    try {
      setLoading(true);
      const query = yyyymmdd ? `?date=${yyyymmdd}` : '';
      const response = await fetch(`/api/palletList${query}`);
      const data = await response.json();
  
      if (Array.isArray(data.data)) {
        setDashboard(data.data);
        setFilteredDashboard(data.data);
      } else {
        console.error('接口返回非数组', data.data);
        setDashboard([]);
        setFilteredDashboard([]);
      }
    } catch (e) {
      console.error(e);
      setError('加载失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };
  const getWarehouseList = async (warehouseInput: string): Promise<Response> => {
    return await fetch(`/api/getWarehouseList?warehouseInput=${warehouseInput}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  };
  const pagedData = filteredDashboard.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDashboard.length / itemsPerPage);
  const handlePrint = async (item: any) =>  {
    const res = await getWarehouseList(item.destination_warehouse)
    const data = await res.json();
    const list: { id: string , name: string}[] = data.list
    const qrImage = await QRCode.toDataURL(item.id);
    if (!list) return;
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
  
      const printContent = `
      <div class="qr-container">
        <div class="watermark">JFK</div>
        <div class="content-row">
          <div class="left-column">${list[0].name}</div>
          
          <div class="right-column">
            <p>G-ID: ${item.date}-${item.destination_warehouse}-${item.box_id}</p>
            <div class="warehouse-ids">
              ${list?.map(w => `<span class="warehouse-id">${w.id}</span>`).join(' ') ?? ''}
            </div>
            <img src="${qrImage}" alt="QR Code" class="qr-img" />
          </div>
        </div>
      </div>`
    ;
      
    const doc = iframe.contentWindow?.document;
    doc?.open();
    doc?.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              position: relative;
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .content-row {
              display: flex;
              width: 90%;
              justify-content: space-between;
              align-items: center;
            }
            .left-column {
              writing-mode: vertical-rl;
              text-orientation: upright;
              font-size: 200px;
              font-weight: bold;
              color: #222;
            }
            .right-column {
              text-align: right;
            }
            .right-column p {
              font-size: 90px;
              margin: 0 0 100px 0;
            }
            .right-column div{
              font-size: 50px;
              margin: 0 250px 0 0;
            }
            .warehouse-ids {
              font-size: 24px;
              margin-bottom: 20px;
            }
            .warehouse-id {
              margin-right: 10px;
              display: inline-block;
            }
            .qr-img {
              width: 180px;
              height: auto;
            }
            .watermark {
              position: fixed; /* 改为 fixed，覆盖整页 */
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 600px;
              font-weight: 900;
              color: rgba(0, 0, 0, 0.04); /* 更淡，更像背景 */
              z-index: 0;
              pointer-events: none;
              user-select: none;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>`
    );
    doc?.close();
    

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 500);
      };
    } catch (err) {
      setError("Failed");
      console.error("Error:", err);
    } finally{
      setError("");
    }
  };
  
  

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin</h2>
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
      <input
                id="date-picker"
                type="date"
                value={datePickerValue}
                onChange={handleDateChange}
                className="w-full px-5 py-4 border border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
              />

      </div>

      {loading && <p style={styles.tip}>加载中...</p>}
      {error && <p style={{ ...styles.tip, color: 'crimson' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={styles.card}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.th}>Box ID</th>
                <th style={styles.th}>起始仓</th>
                <th style={styles.th}>目的仓</th>
                <th style={styles.th}>创建时间</th>
                <th style={styles.th}>打印</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((item, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.td}>{item.box_id}</td>
                  <td style={styles.td}>{item.start_warehouse}</td>
                  <td style={styles.td}>{item.destination_warehouse}</td>
                  <td style={styles.td}>{item.created_at}</td>
                  <td style={styles.td}>
                    <button onClick={() => handlePrint(item)}>Print</button>
                  </td>
                </tr>
              ))}
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
