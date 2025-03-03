'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function CreateQRCode() {
  const [qrCode, setQrCode] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generateQRCode = async () => {
    try {
      const data = `https://q-rcode-tracking.vercel.app/track?item_id=${itemId}`;
      const qrImage = await QRCode.toDataURL(data);
      setQrCode(qrImage);
      setError('');
    } catch (err) {
      setError('二维码生成失败');
      setQrCode('');
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
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">二维码生成成功</h2>
            <img src={qrCode} alt="QR Code" className="mx-auto" />
            <p className="text-center mt-2 text-gray-600">请将二维码保存或打印到产品上</p>
          </div>
        )}
      </div>
    </main>
  );
}
