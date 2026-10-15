'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Users, Shield, Plus, Clock, CheckCircle } from 'lucide-react';

export default function StaffPage() {
  const { activeShift, startShift } = useStore();
  const [cashierName, setCashierName] = useState('Liyema Vanda');
  const [initialFloat, setInitialFloat] = useState<number>(500);
  const [showShiftModal, setShowShiftModal] = useState(false);

  const handleStartNewShift = (e: React.FormEvent) => {
    e.preventDefault();
    startShift(cashierName, initialFloat);
    setShowShiftModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Actor Context */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Actors: System Administrator & Store Manager
            </span>
            <span className="text-xs text-slate-400 font-mono">Staff & Shift Management</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Staff Accounts & Shift Control</h1>
          <p className="text-xs text-slate-400">Manage employee accounts, assign system roles, and control register shifts.</p>
        </div>
        <button
          onClick={() => setShowShiftModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Start New Register Shift
        </button>
      </div>

      {/* Active Shift Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" /> Current Register Shift Status
        </h2>

        {activeShift ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activeShift.id}</span>
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">Cashier: <span className="font-bold text-white">{activeShift.employeeName}</span></p>
              <p className="text-[10px] text-slate-400">Started at: {activeShift.start} | Opening Float: R{activeShift.initialFloat.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-mono">Total Sales</p>
              <p className="text-sm font-extrabold text-white">R{(activeShift?.totalSales ?? (activeShift?.cashSales || 0) + (activeShift?.cardSales || 0)).toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-slate-400">No register shift currently active. Start a shift to begin processing sales at POS.</p>
          </div>
        )}
      </div>

      {/* Registered Staff List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" /> Forte Supermarket Staff Directory (USERS Table)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Liyema Vanda (Programmer / Cashier)</h4>
              <p className="text-[10px] text-slate-400 font-mono">Role: Cashier | PIN: 1234</p>
            </div>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold">
              Active
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">S. Ndlovu (Store Manager)</h4>
              <p className="text-[10px] text-slate-400 font-mono">Role: Manager | PIN: 9999</p>
            </div>
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold">
              Active Admin
            </span>
          </div>
        </div>
      </div>

      {/* Start Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Open New Cashier Shift</h3>

            <form onSubmit={handleStartNewShift} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Cashier Name</label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Opening Till Float (R)</label>
                <input
                  type="number"
                  value={initialFloat}
                  onChange={(e) => setInitialFloat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="w-full bg-slate-800 text-xs py-2.5 rounded-xl font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-xs py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  Open Shift Drawer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}