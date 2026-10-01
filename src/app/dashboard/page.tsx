'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Truck,
  Users,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  lowStockCount: number;
  pendingPOs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 14280.50,
    totalTransactions: 184,
    lowStockCount: 0,
    pendingPOs: 0,
  });

  useEffect(() => {
    // Read dynamic low stock count from localStorage
    const savedInventory = localStorage.getItem('forte_inventory_items');
    if (savedInventory) {
      try {
        const items = JSON.parse(savedInventory);
        const low = items.filter((i: any) => i.stock <= i.minThreshold).length;
        setStats((prev) => ({ ...prev, lowStockCount: low }));
      } catch (e) {
        console.error(e);
      }
    }

    // Read dynamic pending purchase orders count from localStorage
    const savedPOs = localStorage.getItem('forte_purchase_orders');
    if (savedPOs) {
      try {
        const pos = JSON.parse(savedPOs);
        const pending = pos.filter((p: any) => p.status === 'PENDING').length;
        setStats((prev) => ({ ...prev, pendingPOs: pending }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manager Executive Dashboard</h1>
          <p className="text-xs text-slate-400">
            Real-time sales insights, inventory turnover, and operational KPIs for Forte Supermarket.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cashier"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition"
          >
            <ShoppingCart className="w-4 h-4" /> Open POS Terminal
          </Link>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Daily Revenue</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              R {stats.totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-emerald-500 font-medium inline-flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Transactions</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalTransactions}</p>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Avg Basket: R 77.61
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Stock Alerts</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.lowStockCount} Items</p>
            <Link
              href="/inventory"
              className="text-[10px] text-amber-400 hover:underline font-semibold inline-flex items-center gap-1 mt-1"
            >
              Resolve in Inventory <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Pending POs</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{stats.pendingPOs} Orders</p>
            <Link
              href="/suppliers"
              className="text-[10px] text-purple-400 hover:underline font-semibold inline-flex items-center gap-1 mt-1"
            >
              View Supplier Portal <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Revenue Performance */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Department Revenue Distribution</h3>
              <p className="text-xs text-slate-400">Breakdown of gross sales across product categories</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
              Today
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Dairy (Milk, Cheese, Eggs)</span>
                <span className="font-mono text-emerald-400">R 5,840.00 (41%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '41%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Bakery (Fresh Bread, Confectionery)</span>
                <span className="font-mono text-emerald-400">R 3,920.50 (27%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '27%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Pantry (Rice, Coffee, Oils)</span>
                <span className="font-mono text-emerald-400">R 2,980.00 (21%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '21%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Produce (Fresh Fruit & Vegetables)</span>
                <span className="font-mono text-emerald-400">R 1,540.00 (11%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Operational Audit Feed */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Operational Feed
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
              LIVE
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex justify-between font-semibold text-white">
                <span>Sale Completed</span>
                <span className="text-[10px] text-slate-500 font-mono">10 mins ago</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                POS Terminal #01 processed receipt <span className="font-mono text-blue-400">#FT-8921</span> (R 115.49).
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex justify-between font-semibold text-amber-400">
                <span>Auto PO Generated</span>
                <span className="text-[10px] text-slate-500 font-mono">25 mins ago</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Low stock threshold triggered for Instant Coffee 200g.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex justify-between font-semibold text-emerald-400">
                <span>Stock Restocked</span>
                <span className="text-[10px] text-slate-500 font-mono">1 hour ago</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Received purchase order from Clover SA (+50 units Fresh Milk 2L).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}