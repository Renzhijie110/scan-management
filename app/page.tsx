"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const preferredRegion = 'home';
export const dynamic = 'force-dynamic';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json()
  
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }else{
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('warehouse', data.warehouse);
        router.push('/dashboard');
      }

    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
