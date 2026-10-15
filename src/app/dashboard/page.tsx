'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ShoppingCart, Package, AlertTriangle, CheckCircle, Truck, TrendingUp, Settings, Users, Plus, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboardPage() {
  const { products, purchaseOrders, receivePurchaseOrder, currentUser } = useStore();

  // Compute metrics for SC4 / Manager Dashboard
  const todaysSalesTotal = 18650.00; // Simulated/Tracked daily sales
  const pendingOrdersCount = purchaseOrders.filter(po => po.status === 'PENDING').length;
  const totalProductsCount = products.length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Actor Context */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Actor: Store Manager
            </span>
            <span className="text-xs text-slate-400 font-mono"> View Stock & Approve Orders</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Manager Dashboard</h1>
          <p className="text-xs text-slate-400">Monitor operations and manage store activities from one central location.</p>
        </div>
      </div>

      {/* Top Metrics Cards (SC4) */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Today's Sales</span>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white">R{todaysSalesTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] text-green-400 font-semibold">▲ 12% vs yesterday</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Pending Orders</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white">{pendingOrdersCount}</h3>
          <p className="text-[10px] text-slate-400">Awaiting approval</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Products in Stock</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white">{totalProductsCount}</h3>
          <p className="text-[10px] text-slate-400">Across all categories</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-xl font-extrabold text-red-400">{lowStockCount}</h3>
          <p className="text-[10px] text-red-400/80 font-semibold">Need attention</p>
        </div>
      </div>

      {/* Management Tools Navigation Grid (SC4) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Management Tools</h2>
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/inventory"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/10 text-blue-400 p-2.5 rounded-xl border border-blue-500/20">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Stock Management</h4>
                <p className="text-[10px] text-slate-400">Manage inventory and stock levels</p>
              </div>
            </div>
          </Link>

          <Link
            href="/suppliers"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-600/10 text-amber-400 p-2.5 rounded-xl border border-amber-500/20">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Approve Orders</h4>
                <p className="text-[10px] text-slate-400">Review and approve purchase orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/staff"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-600/10 text-green-400 p-2.5 rounded-xl border border-green-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-green-300">Staff Management</h4>
                <p className="text-[10px] text-slate-400">Manage staff and roles</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Section (SC4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Recent Activity Audit Log
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Real-time system events</span>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-bold text-white">Stock delivery received from Clover SA</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Today, 10:24 AM</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-white">Purchase Order PO-8802 approved by Store Manager</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Today, 09:48 AM</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-bold text-white">Daily sales report generated</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Yesterday, 08:30 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}