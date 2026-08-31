'use client';

import { useState } from 'react';

interface ShiftCashUp {
  terminalId: string;
  cashierName: string;
  systemExpected: number;
  cashCounted: number;
  cardCounted: number;
  variance: number;
  status: 'RECONCILED' | 'DISCREPANCY';
}

const DASHBOARD_METRICS = {
  dailySales: 14850.50,
  transactionsCount: 142,
  avgBasketSize: 104.58,
  grossProfitMargin: 28.4,
};

const INITIAL_CASHUPS: ShiftCashUp[] = [
  {
    terminalId: 'Terminal 01',
    cashierName: 'Avela M.',
    systemExpected: 8450.00,
    cashCounted: 4200.00,
    cardCounted: 4250.00,
    variance: 0.00,
    status: 'RECONCILED',
  },
  {
    terminalId: 'Terminal 02',
    cashierName: 'Sipho K.',
    systemExpected: 6400.50,
    cashCounted: 3100.00,
    cardCounted: 3280.00,
    variance: -20.50,
    status: 'DISCREPANCY',
  },
];

export default function DashboardPage() {
  const [cashups] = useState<ShiftCashUp[]>(INITIAL_CASHUPS);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Executive Dashboard & Cash-Up</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time revenue metrics, inventory turnover, and register balancing.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs text-slate-300 font-mono">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>Live Store Sync Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold uppercase">Daily Gross Sales</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">
            R{DASHBOARD_METRICS.dailySales.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-500 font-semibold mt-2">↑ +14% vs yesterday</p>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Transactions</p>
          <p className="text-3xl font-black text-white mt-1">{DASHBOARD_METRICS.transactionsCount}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">Peak hour: 12:00 - 13:00</p>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold uppercase">Avg Basket Value</p>
          <p className="text-3xl font-black text-blue-400 mt-1">
            R{DASHBOARD_METRICS.avgBasketSize.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">~3.8 items per sale</p>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold uppercase">Gross Margin</p>
          <p className="text-3xl font-black text-amber-400 mt-1">{DASHBOARD_METRICS.grossProfitMargin}%</p>
          <p className="text-[10px] text-amber-500 font-semibold mt-2">Target: &gt;25.0%</p>
        </div>
      </div>

      {/* Visual Revenue Breakdown & Top Categories */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <h3 className="text-lg font-bold text-white">Category Revenue Share</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Dairy & Refrigerated</span>
                <span className="font-mono text-emerald-400">R6,450.00 (43%)</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '43%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Pantry Staples</span>
                <span className="font-mono text-emerald-400">R5,200.00 (35%)</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Bakery</span>
                <span className="font-mono text-emerald-400">R3,200.50 (22%)</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <h3 className="text-lg font-bold text-white">Payment Method Split</h3>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-3">
                <span className="text-xl">💳</span>
                <div>
                  <p className="text-xs font-bold text-white">Card Payments</p>
                  <p className="text-[10px] text-slate-400">54% of sales</p>
                </div>
              </div>
              <span className="font-mono font-bold text-white text-sm">R8,019.27</span>
            </div>

            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-3">
                <span className="text-xl">💵</span>
                <div>
                  <p className="text-xs font-bold text-white">Cash Transactions</p>
                  <p className="text-[10px] text-slate-400">46% of sales</p>
                </div>
              </div>
              <span className="font-mono font-bold text-white text-sm">R6,831.23</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Cash-Up Reconciliation */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Shift Cash-Up & Reconciliation</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4">Terminal</th>
                <th className="p-4">Cashier</th>
                <th className="p-4">Expected System Total</th>
                <th className="p-4">Cash Counted</th>
                <th className="p-4">Card Counted</th>
                <th className="p-4">Variance</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {cashups.map((c, i) => (
                <tr key={i} className="hover:bg-slate-750/50">
                  <td className="p-4 font-bold text-white">{c.terminalId}</td>
                  <td className="p-4 font-medium text-slate-300">{c.cashierName}</td>
                  <td className="p-4 font-mono text-slate-300">R{c.systemExpected.toFixed(2)}</td>
                  <td className="p-4 font-mono text-slate-300">R{c.cashCounted.toFixed(2)}</td>
                  <td className="p-4 font-mono text-slate-300">R{c.cardCounted.toFixed(2)}</td>
                  <td className={`p-4 font-mono font-bold ${c.variance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {c.variance < 0 ? `-R${Math.abs(c.variance).toFixed(2)}` : 'R0.00'}
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                        c.status === 'RECONCILED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}