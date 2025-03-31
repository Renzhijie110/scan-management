'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

export default function CreateQRCode() {
  const router = useRouter();
  useEffect(() => {
    const warehouse = localStorage.getItem('warehouse');
    if (warehouse === null) {
      router.push('/'); // 强制跳转回登录页
    }
  }, []);

  const [qrCodes, setQrCodes] = useState<{ itemId: string; qrImage: string; createdAt: string; }[]>([]);
  const [inputText, setInputText] = useState('');
  const [dateInput, setDateInput] = useState("");
  const [warehouseInput, setWarehouseInput] = useState("");
  const [startBox, setStartBox] = useState("");
  const [endBox, setEndBox] = useState("");
  const [error, setError] = useState('');

  const generateQRCodes = async () => {
    if (!dateInput || !warehouseInput || !startBox || !endBox) {
      setError("Please enter all fields: Date, Warehouse, Start, and End Box Numbers (^_^)");
      return;
    }

    const start = parseInt(startBox, 10);
    const end = parseInt(endBox, 10);

    if (isNaN(start) || isNaN(end) || start > end) {
      setError("Invalid Box Number Range! Start should be ≤ End.");
      return;
    }

    const newQrCodes = [];
    try {
      const timestamp = new Date().toLocaleString();
      const user_id = localStorage.getItem("user_id");

      for (let i = start; i <= end; i++) {
        const itemId = `${dateInput} ${warehouseInput} ${i}`;
        const regex = /^\d{6} [A-Z]{3} \d+$/;
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
      }

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
          <img src="${qr.qrImage}" alt="QR Code" />
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
            .highlight2 { font-size: 150px; font-weight: bold; font-family: "Courier New", monospace; }
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
  
  
  return (

    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Generate QR Codes</h1>
        <div className="space-y-4">
          <input
            type="text"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter Date (YYMMDD)"
          />
          <input
            type="text"
            value={warehouseInput}
            onChange={(e) => setWarehouseInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter Warehouse (XXX)"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              value={startBox}
              onChange={(e) => setStartBox(e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Start Box Number"
            />
            <input
              type="number"
              value={endBox}
              onChange={(e) => setEndBox(e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="End Box Number"
            />
          </div>
          <button
            onClick={generateQRCodes}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Generate QR Codes
          </button>
        </div>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {qrCodes.length > 0 && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Finished</h2>
            <div className="grid grid-cols-2 gap-4">
              {qrCodes.map((qr) => (
                <div key={qr.itemId} className="border p-2 rounded-md text-center">
                  <p className="text-gray-600">{qr.itemId}</p>
                  <img src={qr.qrImage} alt="QR Code" className="mx-auto" />
                </div>
              ))}
            </div>
            <button onClick={handlePrint} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
              Print QR Codes
              
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
