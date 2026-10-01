'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Award,
  CreditCard,
  Phone,
  Mail,
  History,
  ShoppingBag,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  accountBalance: number; // Store credit/debt balance
  totalSpent: number;
  lastVisit: string;
}

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Siyasanga Qwabe',
    phone: '0831234567',
    email: 'siyasanga@gmail.com',
    points: 420,
    accountBalance: 0,
    totalSpent: 4200.50,
    lastVisit: '2026-09-28',
  },
  {
    id: '2',
    name: 'Nomsa Dlamini',
    phone: '0729876543',
    email: 'nomsa.d@yahoo.com',
    points: 150,
    accountBalance: -150.00, // Owes R150 on store account
    totalSpent: 1850.00,
    lastVisit: '2026-09-25',
  },
  {
    id: '3',
    name: 'Bongani Kalu',
    phone: '0614567890',
    email: 'bkalu@outlook.com',
    points: 890,
    accountBalance: 200.00, // R200 store credit available
    totalSpent: 8900.00,
    lastVisit: '2026-09-30',
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('forte_customers');
    if (saved) {
      try {
        setCustomers(JSON.parse(saved));
      } catch (e) {
        setCustomers(DEFAULT_CUSTOMERS);
      }
    } else {
      setCustomers(DEFAULT_CUSTOMERS);
    }
  }, []);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name,
      phone,
      email: email || 'N/A',
      points: 50, // Welcome bonus points
      accountBalance: 0,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0],
    };

    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    localStorage.setItem('forte_customers', JSON.stringify(updated));

    setName('');
    setPhone('');
    setEmail('');
    setIsAddCustomerOpen(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">Customer Loyalty & Accounts</h1>
            <p className="text-xs text-slate-400">Track loyalty reward points and store credit accounts</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 transition"
        >
          <UserPlus className="w-4 h-4" /> Register Customer
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer by name, phone number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none font-mono placeholder-slate-500"
          />
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Registered</span>
          <span className="text-sm font-bold font-mono text-white">{customers.length}</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Active Points</span>
          <span className="text-sm font-bold font-mono text-amber-400">
            {customers.reduce((acc, c) => acc + c.points, 0)} pts
          </span>
        </div>
      </div>

      {/* Customer List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl space-y-4 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white text-sm">{customer.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-500" /> {customer.phone}
                </p>
              </div>
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono px-2.5 py-1 rounded-xl flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> {customer.points} pts
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1 text-[11px] font-sans">
                  <Mail className="w-3 h-3 text-slate-500" /> Email:
                </span>
                <span className="text-slate-300 truncate max-w-[140px]">{customer.email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1 text-[11px] font-sans">
                  <ShoppingBag className="w-3 h-3 text-slate-500" /> Total Spend:
                </span>
                <span className="text-emerald-400 font-bold">R {customer.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1 text-[11px] font-sans">
                  <CreditCard className="w-3 h-3 text-slate-500" /> Store Account:
                </span>
                <span
                  className={`font-bold ${
                    customer.accountBalance < 0
                      ? 'text-red-400'
                      : customer.accountBalance > 0
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {customer.accountBalance < 0
                    ? `- R ${Math.abs(customer.accountBalance).toFixed(2)} (Owed)`
                    : `R ${customer.accountBalance.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-900">
              <span className="flex items-center gap-1">
                <History className="w-3 h-3" /> Last Visit: {customer.lastVisit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Register Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white">Register Loyalty Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thabo Mokoena"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0821234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. thabo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold"
                >
                  Save Customer (+50 Bonus Pts)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 bg-slate-900 text-slate-400 rounded-xl font-bold hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}