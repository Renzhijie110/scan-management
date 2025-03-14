'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';


export default function CreateQRCode() {
  const router = useRouter();
  useEffect(() => {
    const warehouse = localStorage.getItem('warehouse');
    if (warehouse !== 'JFK' && warehouse !== 'EWR') {
      router.push('/'); // 强制跳转回登录页
  }

  }, []);

  const [qrCode, setQrCode] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>打印二维码</title>
            <style>
              body { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
              img { max-width: 100%; }
              p { margin-top: 10px; font-size: 60px; color: #333; } /* 调整字体大小 */
              .highlight1 { font-size: 320px; font-weight: bold; } /* 特定部分增大 */
              .highlight2 { font-size: 150px; font-weight: bold; } /* 特定部分增大 */
            </style>
          </head>
          <body>
            <p>G-ID: ${itemId.slice(0, 6)}<br/><span class="highlight1">${itemId.slice(6,10)}</span><br/><span class="highlight2">${itemId.slice(10)}</span>  <img src="${qrCode}" alt="QR Code" /></p>

          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const generateQRCode = async () => {
    if (!itemId) {
      setError('GID不能为空 (^_^)');
      return;
    }
    const regex = /^\d{6} [A-Z]{3} [A-Za-z0-9\-]+$/;
    if (!regex.test(itemId)) {
      setError('GID格式不正确,需要YYMMDD JFK RXX (^_^)');
      return;
    }

    try {
      const data = `https://scan-management.vercel.app/track?item_id=${itemId}`;
      const qrImage = await QRCode.toDataURL(data);
      const timestamp = new Date().toLocaleString();
      const user_id = localStorage.getItem('user_id')
      const response = await fetch('/api/boxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          box_id: itemId,
          qr_code: data,
          created_at: timestamp,
          user_id: user_id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save box data');
      }
      
      setQrCode(qrImage);
      setCreatedAt(timestamp);
      setError('');
    } catch (err) {
      setError('二维码生成失败');
      setQrCode('');
      setCreatedAt('');
      console.error('Error:', err);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">生成二维码</h1>
        
        <div className="mb-4">
          <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-2">
            物品ID
          </label>
          <input
            type="text"
            id="itemId"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="请输入物品ID"
          />
        </div>

        <button
            onClick={generateQRCode}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            生成二维码
          </button>

          {error && (
            <p className="text-red-500 mt-4">{error}</p>
          )}

          {qrCode && (
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold mb-2">二维码生成成功</h2>
              <img src={qrCode} alt="QR Code" className="mx-auto" />
              <p className="text-gray-600 mt-2">物品ID: {itemId}</p>
              <button
                onClick={handlePrint}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                打印二维码
              </button>
            </div>
          )}

      </div>
    </main>
  );
}
