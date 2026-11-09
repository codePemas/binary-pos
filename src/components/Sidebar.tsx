'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [enteredPin, setEnteredPin] = useState('');
  const [targetMode, setTargetMode] = useState<'CASHIER' | 'MANAGER' | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handleOpenPinModal = (mode: 'CASHIER' | 'MANAGER') => {
    setTargetMode(mode);
    setEnteredPin('');
    setIsPinModalOpen(true);
  };

  const handleVerifyPin = () => {
    const CASHIER_PIN = '1234';
    const MANAGER_PIN = '9999';

    if (targetMode === 'CASHIER' && enteredPin !== CASHIER_PIN) {
      alert('❌ Access Denied: Invalid Cashier PIN! (PIN is 1234)');
      setEnteredPin('');
      return;
    }

    if (targetMode === 'MANAGER' && enteredPin !== MANAGER_PIN) {
      alert('❌ Access Denied: Invalid Manager PIN! (PIN is 9999)');
      setEnteredPin('');
      return;
    }

    // PIN matches successfully
    alert('✔ Authentication Successful');
    setIsPinModalOpen(false);
    setEnteredPin('');

    if (targetMode === 'CASHIER') {
      window.location.href = '/cashier';
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <>
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold mb-6 text-blue-400">FORTE POS</h1>
          <div className="flex gap-2 mb-6 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleOpenPinModal('CASHIER')}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cashier
            </button>
            <button
              onClick={() => handleOpenPinModal('MANAGER')}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Manager
            </button>
          </div>

          <nav className="space-y-1">
            <Link href="/cashier" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800 text-slate-300">POS Terminal</Link>
            <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800 text-slate-300">Dashboard</Link>
            <Link href="/inventory" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800 text-slate-300">Inventory</Link>
            <Link href="/suppliers" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800 text-slate-300">Suppliers</Link>
            <Link href="/settings" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800 text-slate-300">Settings</Link>
          </nav>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-white">
            <h2 className="text-lg font-bold">Authorize Switch to {targetMode}</h2>
            <p className="text-xs text-slate-400">Enter your employee PIN to verify credentials.</p>
            
            <input
              type="password"
              maxLength={4}
              placeholder="Enter PIN..."
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-white text-lg tracking-widest focus:outline-none focus:border-blue-500 font-bold"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsPinModalOpen(false); setEnteredPin(''); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyPin}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg"
              >
                Verify & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}