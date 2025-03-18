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
  const [error, setError] = useState('');

  const generateQRCodes = async () => {
    const lines = inputText.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) {
      setError('Please Enter GID (^_^)');
      return;
    }
    
    const regex = /^\d{6} [A-Z]{3} [A-Za-z0-9\-]+$/;
    for (const line of lines) {
      if (!regex.test(line)) {
        setError(`GID Wrong Format: ${line}, Required Format: YYMMDD JFK RXX (^_^)`);
        return;
      }
    }

    try {
      const timestamp = new Date().toLocaleString();
      const user_id = localStorage.getItem('user_id');
      const newQrCodes = await Promise.all(lines.map(async (itemId) => {
        const data = `https://scan-management.vercel.app/track?item_id=${itemId}`;
        const qrImage = await QRCode.toDataURL(data);
        
        await fetch('/api/boxes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ box_id: itemId, qr_code: data, created_at: timestamp, user_id })
        });
        
        return { itemId, qrImage, createdAt: timestamp };
      }));

      setQrCodes(newQrCodes);
      setError('');
    } catch (err) {
      setError('Failed');
      console.error('Error:', err);
    }
  };

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
  
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              @media print {
                .qr-container:not(:first-child) {
                  page-break-before: always;
                }
              }
              body { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
              img { max-width: 100%; }
              p { margin-top: 10px; font-size: 60px; color: #333; }
                .highlight1 { font-size: 320px; font-weight: bold; font-family: "Courier New", monospace; }
                .highlight2 { font-size: 150px; font-weight: bold; font-family: "Courier New", monospace; }
            </style>
          </head>
          <body>
            ${qrCodes.map(qr => `
              <div class="qr-container">
                <p>G-ID: ${qr.itemId.slice(0, 6)}<br/>
                  <span class="highlight1">${qr.itemId.slice(6,10)}</span><br/>
                  <span class="highlight2">${qr.itemId.slice(10)}</span>
                  <img src="${qr.qrImage}" alt="QR Code" />
                </p>
              </div>
            `).join('')}
          </body>
        </html>
      `);
      doc.close();
  
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }

  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Generate QR Code List</h1>
        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter Mutiple GID, one GID per line"
        />
        <button
          onClick={generateQRCodes}
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-blue-600"
        >
          Generate
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {qrCodes.length > 0 && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Finished</h2>
            <div className="grid grid-cols-2 gap-4">
              {qrCodes.map(qr => (
                <div key={qr.itemId} className="border p-2 rounded-md text-center">
                  <p className="text-gray-600">{qr.itemId}</p>
                  <img src={qr.qrImage} alt="QR Code" className="mx-auto" />
                </div>
              ))}
            </div>
            <button
              onClick={handlePrint}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Print QR code
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
