'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [timeString, setTimeString] = useState('');
  const [timeZone, setTimeZone] = useState('America/New_York'); // 默认时区

  useEffect(() => {
    // 读取登录人的时区信息（模拟）
    const tz = localStorage.getItem('userTimeZone');
    if (tz) setTimeZone(tz);

    function updateTime() {
      const now = new Date();

      // 用Intl格式化对应时区时间
      const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      });

      const formattedTime = formatter.format(now);

      // 提取城市名称，假设格式是区域/城市，比如 America/New_York
      const city = timeZone.split('/')[1]?.replace('_', ' ') || timeZone;

      setTimeString(`It's ${formattedTime} in ${city}`);
    }

    updateTime();

    const interval = setInterval(updateTime, 60 * 1000);

    return () => clearInterval(interval);
  }, [timeZone]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f7f1] to-[#eae6df] flex-col space-y-4">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="text-5xl md:text-7xl font-serif font-semibold text-gray-900 tracking-wide"
      >
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#c5a253] rounded-xl blur-sm opacity-30"></span>
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a]">
            Welcome
          </span>
        </span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8, ease: 'easeOut' }}
        className="text-xl text-gray-700 font-mono"
      >
        {timeString}
      </motion.p>
    </main>
  );
}
