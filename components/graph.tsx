'use client';
import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';

export default function Graph() {
  const containerRef = useRef(null);

  const [rawData, setRawData] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [startFilter, setStartFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');

  const filteredData = rawData.filter(entry => {
    return (
      (!dateFilter || entry.date === dateFilter) &&
      (!startFilter || entry.start_warehouse === startFilter) &&
      (!destFilter || entry.destination_warehouse === destFilter)
    );
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/dashboard`);
      const data = await response.json();
      setRawData(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (filteredData.length === 0 || !containerRef.current) return;

    const nodesSet = new Set<string>();
    const edges = filteredData.map((entry: any, index: number) => {
      const {
        start_warehouse,
        destination_warehouse,

      } = entry;
      const total = Number(entry.total_pallet_count);
      const scanned = Number(entry.scan_pallet_count);
      const unscanned = Number(entry.unscanned_count);


      nodesSet.add(start_warehouse);
      nodesSet.add(destination_warehouse);

      return {
        id: index,
        from: start_warehouse,
        to: destination_warehouse,
        label: `已:${scanned} / 总:${total}`,
        title: `总数: ${total}\n已扫: ${scanned}\n未扫: ${unscanned}`,
        arrows: 'to',
        width: Math.max(1, total / 5), // 宽度随总量变化
        color: {
          color: scanned === total ? 'green' : scanned === 0 ? 'red' : 'orange',
        },
      };
    });

    const nodes = Array.from(nodesSet).map((id) => ({
      id,
      label: `仓库 ${id}`,
    }));

    const dataSet = { nodes, edges };

    const options = {
      layout: { hierarchical: false },
      edges: {
        smooth: true,
        arrows: { to: { enabled: true } },
        font: { align: 'middle' },
      },
      nodes: {
        shape: 'dot',
        size: 25,
        font: {
          size: 16,
          color: '#000',     // 字体颜色
          face: 'Arial',     // 字体
          vadjust: -45       // 垂直偏移，可让文字显示在圆点上方或中心（默认在中心）
        },
      },
      physics: false
    };

    const network = new Network(containerRef.current!, dataSet, options);

    return () => network.destroy();
  }, [filteredData]);

  // 提取筛选选项
  const uniqueDates = Array.from(new Set(rawData.map(d => d.date)));
  const uniqueStarts = Array.from(new Set(rawData.map(d => d.start_warehouse)));
  const uniqueDests = Array.from(new Set(rawData.map(d => d.destination_warehouse)));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">货物流向图</h2>

      <div className="mb-4 flex gap-4 items-center">
        <label>
          日期:
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="ml-1 border px-2 py-1">
            <option value="">全部</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>{`${date.slice(4, 6)}/${date.slice(6, 8)}`}</option>
            ))}
          </select>
        </label>

        <label>
          起始仓库:
          <select value={startFilter} onChange={e => setStartFilter(e.target.value)} className="ml-1 border px-2 py-1">
            <option value="">全部</option>
            {uniqueStarts.map(id => (
              <option key={id} value={id}>仓库 {id}</option>
            ))}
          </select>
        </label>

        <label>
          目的仓库:
          <select value={destFilter} onChange={e => setDestFilter(e.target.value)} className="ml-1 border px-2 py-1">
            <option value="">全部</option>
            {uniqueDests.map(id => (
              <option key={id} value={id}>仓库 {id}</option>
            ))}
          </select>
        </label>
      </div>

      <div ref={containerRef} style={{ height: '600px', border: '1px solid #ccc' }} />
    </div>
  );
}
