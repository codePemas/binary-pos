'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  Award,
  Store,
  ShieldCheck,
  LogOut,
  UserCheck,
  Menu,
  X,
} from 'lucide-react';

interface CurrentUser {
  name: string;
  role: 'Store Manager' | 'Cashier' | 'Stock Controller';
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    name: 'Sipho Ndlovu',
    role: 'Store Manager',
  });
  const [isSwitchRoleOpen, setIsSwitchRoleOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Store Manager' | 'Cashier'>('Cashier');

  useEffect(() => {
    const savedUser = localStorage.getItem('forte_current_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'POS Terminal', href: '/cashier', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Suppliers', href: '/suppliers', icon: Truck },
    { name: 'Staff & Shifts', href: '/staff', icon: Users },
    { name: 'Customers', href: '/customers', icon: Award },
  ];

  const handleRoleSwitch = (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: CurrentUser = {
      name: selectedRole === 'Cashier' ? 'Lindiwe Mthembu' : 'Sipho Ndlovu',
      role: selectedRole,
    };

    setCurrentUser(newUser);
    localStorage.setItem('forte_current_user', JSON.stringify(newUser));
    setIsSwitchRoleOpen(false);
    setPinInput('');
  };

  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col md:flex-row font-sans antialiased">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-wide text-white">FORTE POS</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Sidebar Navigation */}
        <aside
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between z-30`}
        >
          <div className="space-y-6">
            <div className="hidden md:flex items-center gap-2 px-2">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wide text-white">FORTE POS</h1>
                <p className="text-[10px] text-slate-400 font-mono">Supermarket ERP v1.0</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer & Switch Role Trigger */}
          <div className="pt-4 border-t border-slate-900 mt-6 md:mt-0">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {currentUser.role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSwitchRoleOpen(true)}
                title="Switch Staff Role / Log Out"
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Role Switcher Modal */}
        {isSwitchRoleOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Switch Terminal Active User</h3>
                  <p className="text-[11px] text-slate-400">Select user role & authorize with PIN</p>
                </div>
              </div>

              <form onSubmit={handleRoleSwitch} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400">Target Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  >
                    <option value="Cashier">Cashier (Lindiwe Mthembu)</option>
                    <option value="Store Manager">Store Manager (Sipho Ndlovu)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400">Security PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center tracking-widest focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold">
                    Authorize & Switch
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSwitchRoleOpen(false)}
                    className="px-4 bg-slate-900 text-slate-400 rounded-xl font-bold hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}