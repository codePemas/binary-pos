'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const isCashierMode = pathname.startsWith('/cashier');

  const handleSwitchToCashier = () => {
    const pin = prompt('🔒 Cashier Authentication Required\nEnter Cashier PIN (1234):');
    if (pin === '1234') {
      alert('✔ Cashier Access Granted');
      window.location.href = '/cashier';
    } else if (pin !== null) {
      alert('❌ Access Denied: Incorrect Cashier PIN!');
    }
  };

  const handleSwitchToManager = () => {
    const pin = prompt('🔒 Manager Authentication Required\nEnter Manager PIN (9999):');
    if (pin === '9999') {
      alert('✔ Manager Access Granted');
      window.location.href = '/dashboard';
    } else if (pin !== null) {
      alert('❌ Access Denied: Incorrect Manager PIN!');
    }
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold mb-6 text-blue-400">FORTE POS</h1>
        
        {/* Role Toggle Switch */}
        <div className="flex gap-2 mb-6 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={handleSwitchToCashier}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              isCashierMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Cashier
          </button>
          <button
            onClick={handleSwitchToManager}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              !isCashierMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Manager
          </button>
        </div>

        {/* Conditional Navigation based on Role */}
        <nav className="space-y-1">
          <Link
            href="/cashier"
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              pathname === '/cashier' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            POS Terminal
          </Link>

          {!isCashierMode && (
            <>
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  pathname === '/dashboard' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/inventory"
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  pathname === '/inventory' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Inventory
              </Link>
              <Link
                href="/suppliers"
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  pathname === '/suppliers' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Suppliers & POs
              </Link>
              <Link
                href="/settings"
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  pathname === '/settings' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Settings
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 text-xs text-slate-500">
        <div>Actor: {isCashierMode ? 'CASHIER (Restricted)' : 'MANAGER (Full Access)'}</div>
      </div>
    </div>
  );
}