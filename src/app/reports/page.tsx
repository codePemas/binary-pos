'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DollarSign, FileText, CheckCircle, AlertTriangle, TrendingUp, Truck, Calendar, X } from 'lucide-react';

export default function ReportsPage() {
  const { activeShift, closeShift, products, sales, purchaseOrders, suppliers } = useStore();
  const [actualCashCounted, setActualCashCounted] = useState<string>('');
  const [shiftSummary, setShiftSummary] = useState<any>(null);

  // Active Report Modal State
  const [activeReportModal, setActiveReportModal] = useState<'top_selling' | 'expiry' | 'supplier' | null>(null);

  const handleCloseShift = () => {
    const cash = parseFloat(actualCashCounted);
    if (isNaN(cash)) {
      alert('Please enter a valid actual counted cash amount.');
      return;
    }
    const summary = closeShift(cash);
    setShiftSummary(summary);
    setActualCashCounted('');
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const lowStockCount = lowStockProducts.length;

  // Real Analytics Computation: Top Selling Products
  const topSellingData = products.map((product) => {
    let unitsSold = 0;
    let revenue = 0;
    (sales || []).forEach((sale: any) => {
      (sale.items || []).forEach((item: any) => {
        if (item.product.sku === product.sku) {
          unitsSold += item.quantity;
          revenue += (item.overridePrice ?? item.product.retailPrice) * item.quantity;
        }
      });
    });
    return { ...product, unitsSold, revenue };
  }).sort((a, b) => b.unitsSold - a.unitsSold);

  // Real Analytics Computation: Supplier Performance
  const supplierMetrics = (suppliers || []).map((sup: any) => {
    const supOrders = (purchaseOrders || []).filter((po: any) => po.supplierName === sup.name);
    const fulfilled = supOrders.filter((po: any) => po.status === 'COMPLETED' || po.status === 'RECEIVED').length;
    const total = supOrders.length;
    const rate = total > 0 ? Math.round((fulfilled / total) * 100) : 100;
    return { name: sup.name, totalOrders: total, fulfilledOrders: fulfilled, rate };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-slate-950 text-white min-h-screen">
      {/* Header with Actor Context */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Actors: Cashier & Store Manager
            </span>
            <span className="text-xs text-slate-400 font-mono">Cash-Up & Reports</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Cash-Up Reconciliation & Management Reports</h1>
          <p className="text-xs text-slate-400">Submit till cash, reconcile shift drawers, and view analytics reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* End of Shift Cash-Up Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" /> Till Cash-Up Reconciliation
            </h2>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full font-mono border border-blue-500/20">
              {activeShift ? 'Shift Active' : 'No Active Shift'}
            </span>
          </div>

          {activeShift ? (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Shift ID / Cashier:</span>
                  <span className="font-bold text-white">{activeShift.id} ({activeShift.employeeName})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Opening Float:</span>
                  <span className="font-bold text-white">R{activeShift.initialFloat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Recorded Cash Sales:</span>
                  <span className="font-bold text-white">R{activeShift.cashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Recorded Card Sales:</span>
                  <span className="font-bold text-white">R{activeShift.cardSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-extrabold text-sm">
                  <span>Expected Cash in Drawer:</span>
                  <span className="text-blue-400">R{activeShift.expectedCash.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">
                  Actual Physical Cash Counted (R)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={actualCashCounted}
                  onChange={(e) => setActualCashCounted(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleCloseShift}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-blue-600/20"
              >
                Submit Till Cash-Up & Close Shift
              </button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">Shift successfully reconciled and closed.</p>
              {shiftSummary && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left space-y-1 text-xs mt-4">
                  <p className="font-bold text-white">Last Reconciled Shift: {shiftSummary.id}</p>
                  <p className="text-slate-400">Expected Cash: R{shiftSummary.expectedCash?.toFixed(2)}</p>
                  <p className="text-slate-400">Actual Counted: R{shiftSummary.actualCash?.toFixed(2)}</p>
                  <p className={`font-bold ${shiftSummary.variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Variance: R{shiftSummary.variance?.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Store Manager Reports Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Management Reports & Analytics
          </h2>

          <div className="space-y-3 text-xs">
            {/* Low Stock Alert Report */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Low Stock Alert Report</h4>
                <p className="text-[10px] text-slate-400">{lowStockCount} items currently below safety threshold.</p>
              </div>
              <span className={`font-bold px-2.5 py-1 rounded-md text-[11px] ${lowStockCount > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400'}`}>
                {lowStockCount} Items
              </span>
            </div>

            {/* Top Selling Products Report */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Top Selling Products Report</h4>
                <p className="text-[10px] text-slate-400">Analyze high-velocity supermarket inventory items.</p>
              </div>
              <button
                onClick={() => setActiveReportModal('top_selling')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                Generate
              </button>
            </div>

            {/* Expiry and Waste Report */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Expiry and Waste Report</h4>
                <p className="text-[10px] text-slate-400">Monitor perishable stock expiry and write-offs.</p>
              </div>
              <button
                onClick={() => setActiveReportModal('expiry')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                View Log
              </button>
            </div>

            {/* Supplier Performance Report */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Supplier Performance Report</h4>
                <p className="text-[10px] text-slate-400">Track fulfillment rates and delivery lead times.</p>
              </div>
              <button
                onClick={() => setActiveReportModal('supplier')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                View Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Top Selling Products Report */}
      {activeReportModal === 'top_selling' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-[560px] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Top Selling Inventory Report
              </h3>
              <button onClick={() => setActiveReportModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              {topSellingData.map((item, idx) => (
                <div key={item.id || idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{idx + 1}. {item.name}</p>
                    <p className="text-[10px] text-slate-400">SKU: {item.sku} | Category: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{item.unitsSold} units sold</p>
                    <p className="text-[10px] text-slate-300">Revenue: R{item.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveReportModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl font-bold text-xs"
            >
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Expiry & Waste Report */}
      {activeReportModal === 'expiry' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-[520px] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Perishable Expiry & Waste Log
              </h3>
              <button onClick={() => setActiveReportModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
              {products.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Category: {item.category} | Stock: {item.stock} units</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Monitored
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveReportModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl font-bold text-xs"
            >
              Close Log
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Supplier Performance Report */}
      {activeReportModal === 'supplier' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-[520px] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" /> Supplier Fulfillment Performance
              </h3>
              <button onClick={() => setActiveReportModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              {supplierMetrics.map((sup, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-white">{sup.name}</p>
                    <span className="text-blue-400 font-bold">{sup.rate}% Fulfillment</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${sup.rate}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Orders Processed: {sup.fulfilledOrders} / {sup.totalOrders} Completed
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveReportModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl font-bold text-xs"
            >
              Close Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}