'use client';

import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Receipt,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';

interface StoreSettings {
  storeName: string;
  taxRate: number;
  currencySymbol: string;
  address: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  enableOfflineMode: boolean;
  requirePinForDiscounts: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Forte Supermarket',
  taxRate: 15,
  currencySymbol: 'R',
  address: '12 Main Street, East London',
  phone: '043 700 0000',
  receiptHeader: 'Thank you for shopping at Forte!',
  receiptFooter: 'Please retain receipt for returns within 14 days.',
  enableOfflineMode: true,
  requirePinForDiscounts: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forte_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Fallback to default if parsing fails
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('forte_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-400" /> Store Configuration & System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage store details, VAT calculations, receipt customization, and manager access controls.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" /> Saved Successfully!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info & Tax */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Store className="w-4 h-4 text-amber-400" /> Store Profile & Tax
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-mono mb-1">VAT Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Receipt Customization & Controls */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Receipt className="w-4 h-4 text-emerald-400" /> Receipt Header & Security
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Receipt Header Message</label>
              <input
                type="text"
                value={settings.receiptHeader}
                onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Receipt Footer Message</label>
              <input
                type="text"
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="pt-2 border-t border-slate-900 space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-sans">Enable Local Cache / Offline Storage</span>
                <input
                  type="checkbox"
                  checked={settings.enableOfflineMode}
                  onChange={(e) => setSettings({ ...settings, enableOfflineMode: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-sans">Require Manager PIN for Item Discounts</span>
                <input
                  type="checkbox"
                  checked={settings.requirePinForDiscounts}
                  onChange={(e) => setSettings({ ...settings, requirePinForDiscounts: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}