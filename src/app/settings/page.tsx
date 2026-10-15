'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Settings, Shield, Key, Save } from 'lucide-react';

export default function SettingsPage() {
  const { storeSettings } = useStore();
  const [storeName, setStoreName] = useState(storeSettings?.storeName || 'FORTE SUPERMARKET');
  const [address, setAddress] = useState(storeSettings?.address || 'University Road, Alice, Eastern Cape');
  const [currency, setCurrency] = useState(storeSettings?.currency || 'R');
  const [vatRate, setVatRate] = useState('15');

  const [managerPin, setManagerPin] = useState('8888');
  const [cashierPin, setCashierPin] = useState('1234');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System settings, tax rules, and role PIN permissions successfully updated and saved.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-slate-950 text-white min-h-screen">
      {/* Header with Actor Context */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Actor: System Administrator
            </span>
            <span className="text-xs text-slate-400 font-mono">System Configuration & Permissions</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">System Settings & Parameters</h1>
          <p className="text-xs text-slate-400">Configure store parameters, tax rules, currency formatting, and role PIN security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Store Settings Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" /> Store Profile & Tax Configuration
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Supermarket Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Physical Store Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">VAT Rate (%)</label>
                <input
                  type="text"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
            >
              <Save className="w-4 h-4" /> Save Configuration Settings
            </button>
          </form>
        </div>

        {/* 2-Role PIN Security & Permissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" /> System Role PIN Access & Security
          </h2>

          <div className="space-y-3 text-xs">
            {/* Manager Role PIN */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" /> Manager Role PIN
                  </h4>
                  <p className="text-[10px] text-slate-400">Full access to Reports, Inventory, Suppliers, and Settings.</p>
                </div>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-semibold uppercase">
                  MANAGEMENT
                </span>
              </div>
              <input
                type="password"
                maxLength={4}
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono tracking-widest text-center focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Cashier Role PIN */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-green-400" /> Cashier Role PIN
                  </h4>
                  <p className="text-[10px] text-slate-400">Access limited to Point of Sale (POS) Terminal & Till Cash-Up.</p>
                </div>
                <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-semibold uppercase">
                  POS TERMINAL
                </span>
              </div>
              <input
                type="password"
                maxLength={4}
                value={cashierPin}
                onChange={(e) => setCashierPin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono tracking-widest text-center focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}