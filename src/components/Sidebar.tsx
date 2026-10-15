'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore, UserRole } from '@/context/StoreContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, activeRoleView, switchRoleWithPin, logout } = useStore();

  const [mounted, setMounted] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('cashier');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Prevent SSR Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenSwitch = (role: UserRole) => {
    setTargetRole(role);
    setPinInput('');
    setPinError('');
    setShowSwitchModal(true);
  };

  const handleConfirmSwitch = () => {
    const success = switchRoleWithPin(pinInput, targetRole);
    if (success) {
      setShowSwitchModal(false);
      setPinInput('');
    } else {
      setPinError('Invalid PIN or Unauthorized for Manager access');
    }
  };

  const cashierMenu = [{ name: 'POS Terminal', href: '/cashier' }];

  const managerMenu = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Suppliers', href: '/suppliers' },
    { name: 'Staff & Shifts', href: '/staff' },
    { name: 'Reports', href: '/reports' },
    { name: 'Customers', href: '/customers' },
    { name: 'Settings', href: '/settings' },
  ];

  // Render cashier menu fallback until client mount is complete to guarantee zero SSR hydration mismatch
  const currentRole = mounted ? activeRoleView?.toLowerCase() : 'manager';
  const currentMenu = currentRole === 'manager' ? [...cashierMenu, ...managerMenu] : cashierMenu;

  if (!mounted) {
    return null; // Avoid rendering mismatch tree before client hydration
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen p-4 text-slate-100 shrink-0">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h1 className="font-extrabold text-lg text-white">FORTE POS</h1>
            <span className="text-xs text-blue-400 font-mono uppercase">
              MODE: {activeRoleView}
            </span>
          </div>
        </div>

        {/* Role Switcher Controls */}
        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex gap-1 mb-6">
          <button
            onClick={() => handleOpenSwitch('cashier')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRoleView?.toLowerCase() === 'cashier'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cashier
          </button>
          <button
            onClick={() => handleOpenSwitch('manager')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRoleView?.toLowerCase() === 'manager'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manager
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {currentMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-800 text-blue-400 border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      {currentUser && (
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 uppercase">{currentUser.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-red-400 hover:underline font-semibold"
          >
            Lock
          </button>
        </div>
      )}

      {/* PIN Verification Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-80 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">
              Authorize Switch to {targetRole.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400">
              Enter your employee PIN to verify credentials.
            </p>

            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />

            {pinError && <p className="text-[11px] text-red-400 font-semibold">{pinError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="w-full bg-slate-800 text-xs py-2.5 rounded-xl font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="w-full bg-blue-600 hover:bg-blue-500 text-xs py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20"
              >
                Verify & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}