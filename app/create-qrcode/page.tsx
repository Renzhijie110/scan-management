'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

export default function CreateQRCode() {
  const router = useRouter();

  const [qrCodes, setQrCodes] = useState<{ itemId: string; qrImage: string; createdAt: string; }[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [warehouseInput, setWarehouseInput] = useState("");
  const [error, setError] = useState('');
  const [datePickerValue, setDatePickerValue] = useState(''); // YYYY-MM-DD格式
  useEffect(() => {
    const today = new Date();
    // 设置默认日期选择器值格式 YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const formattedPickerDate = `${yyyy}-${mm}-${dd}`;
    setDatePickerValue(formattedPickerDate);

    // 设置默认YYMMDD格式给dateInput
    const yy = yyyy.toString().slice(2);
    setDateInput(`${yy}${mm}${dd}`);
  }, []);
  
  const generateQRCodes = async () => {
    if (!dateInput || !warehouseInput ) {
      setError("Please enter all fields: Date, Warehouse (^_^)");
      return;
    }


    const newQrCodes = [];
    try {
      const timestamp = new Date().toLocaleString();
      const user_id = localStorage.getItem("user_id");


        const itemId = `${dateInput} ${warehouseInput}`;
        const regex = /^\d{6} \d+$/;
        if (!regex.test(itemId)) {
          setError(`GID Wrong Format: ${itemId}, Required Format: YYMMDD XXX X (^_^)`);
          return;
        }

        const data = `${itemId}`;
        const qrImage = await QRCode.toDataURL(data);

        await fetch("/api/boxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ box_id: itemId, created_at: timestamp, user_id }),
        });

        newQrCodes.push({ itemId, qrImage, createdAt: timestamp });
    


      setQrCodes(newQrCodes);
      setError("");
    } catch (err) {
      setError("Failed");
      console.error("Error:", err);
    }
  };
  
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
  
    // 检查 printWindow 是否成功打开
    if (!printWindow) {
      alert("无法打开打印窗口，请允许浏览器弹出窗口后重试。");
      return;
    }
  
    const printContent = qrCodes.map(qr => `
      <div class="qr-container">
        <p>G-ID: ${qr.itemId.slice(0, 6)}<br/>
          <span class="highlight1">${qr.itemId.slice(6,10)}</span><br/>
          <span class="highlight2">${qr.itemId.slice(10)}</span>
          <img src="${qr.qrImage}" alt="QR Code" style="float: right; width: 180px; height: auto;" />
        </p>
      </div>
    `).join('');
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            @media print {
              .qr-container:not(:first-child) { page-break-before: always; }
            }
            body { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            img { max-width: 100%; }
            p { margin-top: 10px; font-size: 60px; color: #333; }
            .highlight1 { font-size: 320px;  font-family: "Courier New", monospace; }
            .highlight2 { font-size: 150px;  font-family: "Courier New", monospace; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
  
    printWindow.document.close();
  
    // 等待 500ms，确保页面加载后再打印
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };


    // 处理日期选择器变化，自动转成YYMMDD
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value; // 格式 YYYY-MM-DD
      setDatePickerValue(val);
  
      if (!val) {
        setDateInput('');
        return;
      }
  
      const [yyyy, mm, dd] = val.split('-');
      const yy = yyyy.slice(2);
      setDateInput(`${yy}${mm}${dd}`);
    };
  
    return (
      <main className="min-h-screen p-12 bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-700">Generate QR Codes</h1>
          <div className="space-y-6">
            <div>
              <label htmlFor="date-picker" className="block mb-3 font-semibold text-lg text-gray-800">
                Select Date
              </label>
              <input
                id="date-picker"
                type="date"
                value={datePickerValue}
                onChange={handleDateChange}
                className="w-full px-5 py-4 border border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
              <p className="mt-3 text-gray-600 text-lg">
                Selected format: <span className="font-mono text-blue-600">{dateInput}</span>
              </p>
            </div>
    
            <div>
              <label htmlFor="warehouse" className="block mb-3 font-semibold text-lg text-gray-800">
                Warehouse Number
              </label>
              <input
                id="warehouse"
                type="text"
                value={warehouseInput}
                onChange={(e) => setWarehouseInput(e.target.value)}
                placeholder="Enter Warehouse Number"
                className="w-full px-5 py-4 border border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
            </div>
    
            <button
              onClick={generateQRCodes}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-2xl py-4 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-500 transition"
            >
              Generate QR Codes
            </button>
          </div>
    
          {error && (
            <p className="text-red-600 mt-6 text-center font-semibold text-lg">{error}</p>
          )}
    
          {qrCodes.length > 0 && (
            <div className="mt-12 text-center">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800">Finished</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {qrCodes.map((qr) => (
                  <div
                    key={qr.itemId}
                    className="border border-gray-300 p-4 rounded-xl shadow-sm hover:shadow-lg transition"
                  >
                    <p className="text-gray-700 text-xl font-mono mb-4">{qr.itemId}</p>
                    <img src={qr.qrImage} alt="QR Code" className="mx-auto w-48 h-auto" />
                  </div>
                ))}
              </div>
              <button
                onClick={handlePrint}
                className="mt-10 bg-gradient-to-r from-green-600 to-green-400 text-white font-bold text-2xl py-4 rounded-lg shadow-md hover:from-green-700 hover:to-green-500 transition"
              >
                Print QR Codes
              </button>
            </div>
          )}
        </div>
      </main>
    );
    
}
