'use client';

import { useEffect, useState} from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType} from 'html5-qrcode';
import { useRouter } from 'next/navigation';

export default function SortingPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [scanningInProgress, setScanningInProgress] = useState(false); // 防止重复扫描

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        const itemId = decodedText;
        if (itemId && !scanningInProgress) { // 如果没有扫描进行中
          handleScan(itemId);
        }
      },
      (errorMessage) => {
        console.warn(errorMessage);
      }
    );

    return () => {
      scanner.clear();
    };
  }, [scanningInProgress]);

  const handleScan = async (itemId: string) => {
    setScanningInProgress(true); // 标记扫描开始
    setStatus('scanning');
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage(`${itemId} 分拣扫描成功`);
        setTimeout(() => {
          setScanningInProgress(false); // 扫描完成后重置
          router.push('/sorting');
        }, 3000);
      } else {
        throw new Error('扫描失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('扫描失败，请重试');
      setScanningInProgress(false); // 扫描失败时也重置
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">分拣扫描</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-center">请将二维码对准扫描框</p>
          </div>

          <div id="reader" className="mb-4"></div>

          {status !== 'idle' && (
            <div className={`mt-4 p-4 rounded-md ${status === 'success' ? 'bg-green-100 text-green-700' : status === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}