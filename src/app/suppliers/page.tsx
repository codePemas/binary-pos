'use client';

import { useState, useEffect } from 'react';
import { Truck, Plus, PackageCheck, Clock, CheckCircle, Mail, Phone } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  supplier: string;
  itemDetails: string;
  totalCost: number;
  status: 'PENDING' | 'DELIVERED';
}

const DEFAULT_POS: PurchaseOrder[] = [
  {
    id: 'PO-8801',
    supplier: 'Clover SA',
    itemDetails: 'Fresh Milk 2L (x50)',
    totalCost: 1200.0,
    status: 'DELIVERED',
  },
  {
    id: 'PO-8802',
    supplier: 'Sasko Bakery',
    itemDetails: 'White Bread 700g (x30)',
    totalCost: 345.0,
    status: 'PENDING',
  },
];

export default function SuppliersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const savedPOs = localStorage.getItem('forte_purchase_orders');
    if (savedPOs) {
      try {
        const parsed = JSON.parse(savedPOs);
        setPurchaseOrders([...parsed, ...DEFAULT_POS]);
      } catch (e) {
        setPurchaseOrders(DEFAULT_POS);
      }
    } else {
      setPurchaseOrders(DEFAULT_POS);
    }
  }, []);

  const markAsReceived = (id: string) => {
    const updated = purchaseOrders.map((po) =>
      po.id === id ? { ...po, status: 'DELIVERED' as const } : po
    );
    setPurchaseOrders(updated);

    const localOnly = updated.filter((po) => !DEFAULT_POS.some((d) => d.id === po.id));
    localStorage.setItem('forte_purchase_orders', JSON.stringify(localOnly));
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier & Purchasing Portal</h1>
          <p className="text-xs text-slate-400">
            Manage wholesale vendors and process stock restock purchase orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Supplier
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30">
            <Plus className="w-4 h-4" /> Create Purchase Order
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-white mb-3">Active Suppliers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">Clover SA</h4>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-medium">
                Dairy
              </span>
            </div>
            <p className="text-xs text-slate-400">Contact: Sibusiso Dlamini</p>
            <div className="space-y-1 pt-2 border-t border-slate-900 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> orders@clover.co.za
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> +27 43 701 1000
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">Sasko Bakery</h4>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-medium">
                Bakery
              </span>
            </div>
            <p className="text-xs text-slate-400">Contact: Nomsa Mbeki</p>
            <div className="space-y-1 pt-2 border-t border-slate-900 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> supply@sasko.co.za
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> +27 43 702 2200
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">Nestlé Foods</h4>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-medium">
                Pantry
              </span>
            </div>
            <p className="text-xs text-slate-400">Contact: Johan Pretorius</p>
            <div className="space-y-1 pt-2 border-t border-slate-900 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> sales@nestle.co.za
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> +27 43 703 3300
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" /> Purchase Orders & Deliveries
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {purchaseOrders.length} Total Orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Item Details</th>
                <th className="p-3.5">Total Cost</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-3.5 font-mono font-semibold text-blue-400">{po.id}</td>
                  <td className="p-3.5 font-semibold text-white">{po.supplier}</td>
                  <td className="p-3.5 text-slate-300">{po.itemDetails}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    R {po.totalCost.toFixed(2)}
                  </td>
                  <td className="p-3.5">
                    {po.status === 'DELIVERED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <CheckCircle className="w-3 h-3" /> DELIVERED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {po.status === 'PENDING' ? (
                      <button
                        onClick={() => markAsReceived(po.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> Receive Stock
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[11px] font-mono">Completed</span>
                    )}
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