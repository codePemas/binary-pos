'use client';

import React, { useState } from 'react';
import { useStore, Customer } from '@/context/StoreContext';
import { Users, Award, Phone, Plus, Search } from 'lucide-react';

export default function CustomersPage() {
  const { customers, addCustomer } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Filter customers by name or phone number
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill in both name and phone number.');
      return;
    }
    addCustomer({ name, phone, points: 0 });
    setName('');
    setPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Actor Context */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Actors: Cashier & Store Manager
            </span>
            <span className="text-xs text-slate-400 font-mono">Customer Loyalty & Rewards</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Customer Loyalty Portal</h1>
          <p className="text-xs text-slate-400">Manage customer reward points, lookup profiles, and register new loyalty members.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Register Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Registered Loyalty Members
          </h2>
          <span className="text-xs text-slate-400 font-mono">{filteredCustomers.length} Members Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                <th className="pb-3">Customer ID</th>
                <th className="pb-3">Full Name</th>
                <th className="pb-3">Phone Number</th>
                <th className="pb-3">Reward Points</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id || cust.phone} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 font-mono font-bold text-white">{cust.id || 'N/A'}</td>
                  <td className="py-3 text-white font-medium">{cust.name}</td>
                  <td className="py-3 text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" /> {cust.phone}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono">
                      <Award className="w-3 h-3" /> {cust.points} Points
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-semibold uppercase">
                      Active Member
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Register New Loyalty Customer</h3>
            
            <form onSubmit={handleRegisterCustomer} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sibusiso Khumalo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0825551234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full bg-slate-800 text-xs py-2.5 rounded-xl font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-xs py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}