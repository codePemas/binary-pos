'use client';

import { useState } from 'react';
import { Users, Search, UserPlus, Mail, Phone, ShoppingBag } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
}

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Thabo Mokoena', email: 'thabo@example.com', phone: '082 123 4567', loyaltyPoints: 120, totalSpent: 2450.00 },
  { id: '2', name: 'Nomsa Dlamini', email: 'nomsa@example.com', phone: '073 987 6543', loyaltyPoints: 45, totalSpent: 890.50 },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Customer Management & Loyalty
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track customer accounts, contact information, and purchase history.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4 text-right">Loyalty Points</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs font-mono">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 font-bold text-white font-sans">{c.name}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex flex-col text-[11px]">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {c.phone}</span>
                      <span className="flex items-center gap-1 text-slate-500"><Mail className="w-3 h-3 text-slate-500" /> {c.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-amber-400 font-bold">{c.loyaltyPoints} pts</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">R {c.totalSpent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}