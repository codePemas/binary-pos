'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Package,
  Truck,
  LayoutDashboard,
  UserCheck,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import './globals.css';

export type Role = 'CASHIER' | 'INVENTORY_CLERK' | 'MANAGER';

interface UserProfile {
  id: string;
  name: string;
  role: Role;
  terminal: string;
  pin: string;
}

const USERS: Record<Role, UserProfile> = {
  CASHIER: {
    id: '#4092',
    name: 'Avela M. (Cashier)',
    role: 'CASHIER',
    terminal: 'Terminal 01',
    pin: '1111',
  },
  INVENTORY_CLERK: {
    id: '#1104',
    name: 'Sipho K. (Inventory)',
    role: 'INVENTORY_CLERK',
    terminal: 'Back Office',
    pin: '2222',
  },
  MANAGER: {
    id: '#0001',
    name: 'Liyema P. (Manager)',
    role: 'MANAGER',
    terminal: 'Admin HQ',
    pin: '4092',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentRole, setCurrentRole] = useState<Role>('CASHIER');
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const currentUser = USERS[currentRole];

  // Role permissions check
  const isAllowed = (path: string): boolean => {
    if (currentRole === 'MANAGER') return true;
    if (currentRole === 'CASHIER' && path === '/cashier') return true;
    if (
      currentRole === 'INVENTORY_CLERK' &&
      (path === '/inventory' || path === '/suppliers')
    )
      return true;
    return false;
  };

  const handleRoleSelect = (selectedRole: Role) => {
    if (selectedRole === currentRole) return;
    setPendingRole(selectedRole);
    setPinInput('');
    setPinError(false);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRole) return;

    const targetUser = USERS[pendingRole];
    if (pinInput === targetUser.pin) {
      setCurrentRole(pendingRole);
      setPendingRole(null);
      setPinInput('');
      setPinError(false);

      if (pendingRole === 'CASHIER') router.push('/cashier');
      if (pendingRole === 'INVENTORY_CLERK') router.push('/inventory');
      if (pendingRole === 'MANAGER') router.push('/dashboard');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        {/* Navigation Bar */}
        <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.jpeg"
                alt="Forte Supermarket Logo"
                width={36}
                height={36}
                className="rounded-lg object-contain"
              />
              <div>
                <span className="font-bold text-slate-100 tracking-wide block leading-tight">
                  Binary Systems
                </span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block">
                  Forte Enterprise POS
                </span>
              </div>
            </div>

            {/* Navigation filtered by active user permissions */}
            <nav className="flex space-x-1 text-sm font-medium">
              {isAllowed('/cashier') && (
                <Link
                  href="/cashier"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === '/cashier'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-blue-400" />
                  <span>Cashier POS</span>
                </Link>
              )}

              {isAllowed('/inventory') && (
                <Link
                  href="/inventory"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === '/inventory'
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Inventory & Stock</span>
                </Link>
              )}

              {isAllowed('/suppliers') && (
                <Link
                  href="/suppliers"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === '/suppliers'
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Suppliers</span>
                </Link>
              )}

              {isAllowed('/dashboard') && (
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === '/dashboard'
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  <span>Manager Reports</span>
                </Link>
              )}
            </nav>
          </div>

          {/* User Switching / Authentication Bar */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-300">{currentUser.terminal}</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <UserCheck className="w-4 h-4 text-blue-400 ml-1" />
              <select
                className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
                value={currentRole}
                onChange={(e) => handleRoleSelect(e.target.value as Role)}
              >
                <option value="CASHIER" className="bg-slate-900 text-white">
                  Cashier (PIN: 1111)
                </option>
                <option value="INVENTORY_CLERK" className="bg-slate-900 text-white">
                  Inventory Clerk (PIN: 2222)
                </option>
                <option value="MANAGER" className="bg-slate-900 text-white">
                  Store Manager (PIN: 4092)
                </option>
              </select>
            </div>

            <div className="text-right pl-2 border-l border-slate-800">
              <p className="font-semibold text-slate-200">{currentUser.name}</p>
              <p className="text-slate-400 text-[10px]">ID: {currentUser.id}</p>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col">
          {!isAllowed(pathname) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-4">
                <ShieldAlert className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Access Restricted
              </h2>
              <p className="text-slate-400 text-sm max-w-md mb-6">
                Your current role (<span className="text-white font-semibold">{currentRole}</span>) is not authorized to access <span className="font-mono text-amber-400">{pathname}</span>.
              </p>
              <button
                onClick={() => handleRoleSelect(currentRole)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition"
              >
                Return to Permitted Workspace
              </button>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Authentication Security Modal */}
        {pendingRole && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handlePinSubmit}
              className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 text-center"
            >
              <div className="mx-auto w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Authenticate as {USERS[pendingRole].name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter 4-digit PIN for access (Demo PIN: <span className="font-mono text-emerald-400">{USERS[pendingRole].pin}</span>)
                </p>
              </div>

              <div>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="• • • •"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-2xl font-mono tracking-widest bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
                {pinError && (
                  <p className="text-xs text-red-400 font-semibold mt-2">
                    Incorrect PIN. Authorization failed.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingRole(null)}
                  className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition"
                >
                  Verify PIN
                </button>
              </div>
            </form>
          </div>
        )}
      </body>
    </html>
  );
}