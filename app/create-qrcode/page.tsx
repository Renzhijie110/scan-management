'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';


export default function CreateQRCode() {

  const [qrCode, setQrCode] = useState<{ pallet_id: string; qrImage: string } | null>(null);
  const [warehouseList, setWarehouseList] = useState<{ id: string; name: string }[] | null>(null);
  const [dateInput, setDateInput] = useState("");
  const [warehouseInput, setWarehouseInput] = useState('');
  const [selectedOptionsw, setSelectedOptionsw] = useState<17 | 181>(17);
  const [error, setError] = useState('');
  const [boxId, setBoxId] = useState(0);
  const [datePickerValue, setDatePickerValue] = useState(''); // YYYY-MM-DD格式
  const [qrloading, setQRLoading] = useState(false);
  const [printloading, setPrintloading] = useState(false);

  useEffect(() => {
    const today = new Date();
    // 设置默认日期选择器值格式 YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const formattedPickerDate = `${yyyy}-${mm}-${dd}`;
    setDatePickerValue(formattedPickerDate);
    setDateInput(`${yyyy}${mm}${dd}`);
  }, []);
  const createPallet = async (dateInput:any,selectedOptionsw:any,warehouseInput:any,boxId:any): Promise<Response> => {
    return await fetch("/api/createPallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pallet_group_id: `${dateInput}_${selectedOptionsw}_${warehouseInput}`, boxId: boxId, date: dateInput,sw:selectedOptionsw,dw:warehouseInput}),
    });
  };
  const getPalletMax = async (pallet_group_id: any): Promise<Response> => {
    return await fetch(`/api/getPalletMax?pallet_group_id=${pallet_group_id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  };
  const getWarehouseList = async (warehouseInput: string, start_warehouse: string): Promise<Response> => {
    return await fetch(`/api/getWarehouseList?warehouseInput=${warehouseInput}&start_warehouse=${start_warehouse}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  };


  const generateQRCode = async () => {
    if (!selectedOptionsw || !dateInput || !warehouseInput) {
      setError("Please enter all fields: Date, Warehouse (^_^)");
      return;
    }
    if (isNaN(Number(warehouseInput))) {
      const pallet_group_id = `${dateInput}_${selectedOptionsw}_${warehouseInput}`;
      setError(`GID Wrong Format: ${pallet_group_id} (^_^)`);
      return;
    }
    var list
    const res = await getWarehouseList(warehouseInput,String(selectedOptionsw));
    const data = await res.json();
    list = data.list;

    if (list.length === 0) {
      setError("Invalid Warehouse Number");
      return;
    }
    setQRLoading(true)
    setWarehouseList(list);  // 设置状态

    try {
      const pallet_group_id = `${dateInput}_${selectedOptionsw}_${warehouseInput}`;
      const response = await getPalletMax(pallet_group_id);
      const data = await response.json();
      const boxId = data.length + 1
      setBoxId(data.length + 1)
      const pallet_id = `${pallet_group_id}_${boxId}`;
      const qrImage = await QRCode.toDataURL(pallet_id);
  
      setQrCode({ pallet_id, qrImage });
      setError("");
    } catch (err) {
      setError("Failed");
      console.error("Error:", err);
    } finally{
      setQRLoading(false)
    }
  };
  
  const getWarehouse = (input: number) => {
    if(input === 17){
      return "JFK"
    }else if(input === 181){
      return "NJ25"
    }else{
      return
    }
  }
  const handlePrint = async () =>  {
    if (!qrCode || !dateInput || !selectedOptionsw || !warehouseInput || !boxId) {
      setError("请确保所有输入项都已填写并生成二维码");
      return;
    }
    setPrintloading(true)
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
  
      const printContent = 
      `<div class="qr-container">
        <div class="watermark">${getWarehouse(Number(selectedOptionsw))}</div>
        <div class="content-row">
          <div class="left-column">${warehouseList?.[0]?.name}</div>
          
          <div class="right-column">
            <p>G-ID: ${dateInput.slice(0, 8)}-${warehouseInput}-${boxId}</p>
            <div class="warehouse-ids">
              ${warehouseList?.map(w => `<span class="warehouse-id">${w.id}</span>`).join(' ') ?? ''}
            </div>
            <img src="${qrCode.qrImage}" alt="QR Code" class="qr-img" />
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
            @page {
              size: landscape;
            }
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
              font-size: 40px;
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
              font-size: 500px;
              font-weight: 900;
              color: rgba(0, 0, 0, 0.03); /* 更淡，更像背景 */
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
      await createPallet(dateInput,selectedOptionsw,warehouseInput,boxId)
      setWarehouseList([]);
      setWarehouseInput("");
      setQrCode(null);
      setError("");
      setPrintloading(false)
    }
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
      setDateInput(`${yyyy}${mm}${dd}`);
  };
  return (
      <main className="min-h-screen p-12 bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-700">Generate QR Codes</h1>
          <div className="space-y-6">
          <label htmlFor="date-picker" className="block mb-3 font-semibold text-lg text-gray-800">
            Start Warehouse
          </label>
          <div style={{ fontSize: '18px', display: 'flex', gap: '20px' }}>
              {([17, 181] as const).map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="swSelect"
                    value={option}
                    checked={selectedOptionsw === option}
                    onChange={() => setSelectedOptionsw(option)}
                    style={{ marginRight: '8px' }}
                  />
                  {option}
                </label>
              ))}
            </div>
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
                Destination Warehouse Number
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
              onClick={generateQRCode}
              disabled={qrloading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-2xl py-4 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-500 transition"
            >
              {qrloading ? 'Generating...' : 'Generate QR Codes'}
            </button>
          </div>
    
          {error && (
            <p className="text-red-600 mt-6 text-center font-semibold text-lg">{error}</p>
          )}
    
          {qrCode && (
            <div className="mt-12 text-center">
              <div className="border border-gray-300 p-4 rounded-xl shadow-sm hover:shadow-lg transition inline-block">
                <p className="text-gray-700 text-xl font-mono mb-4">{qrCode.pallet_id}</p>
                <img src={qrCode.qrImage} alt="QR Code" className="mx-auto w-48 h-auto" />
              </div>
              <button
                onClick={handlePrint}
                disabled={printloading}
                className="mt-10 bg-gradient-to-r from-green-600 to-green-400 text-white font-bold text-2xl py-4 rounded-lg shadow-md hover:from-green-700 hover:to-green-500 transition"
              >
                {printloading ? 'Printing...' : 'Print Pallet Label'}       
              </button>
            </div>
          )}
        </div>
      </main>
  );
}
