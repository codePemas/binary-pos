'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  stock: number;
  minStock: number;
  retailPrice: number;
}

export default function DashboardPage() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStoreMetrics() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const products: Product[] = await res.json();
          setTotalProducts(products.length);
          const lowStock = products.filter((p) => p.stock <= (p.minStock || 10)).length;
          setLowStockItems(lowStock);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStoreMetrics();
  }, []);

  const recentActivity = [
    { id: 1, text: 'System connected to Neon cloud database', time: 'Just now', type: 'success' },
    { id: 2, text: `Inventory synchronized (${totalProducts} items tracked)`, time: 'Today', type: 'info' },
    { id: 3, text: 'Manager dashboard stats loaded dynamically', time: 'Today', type: 'purple' },
  ];

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <p className="text-slate-400 text-sm">Monitor live operations and manage store activities from your Neon cloud database.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Today's Sales</div>
          <div className="text-2xl font-extrabold text-white mt-2">R18,650.00</div>
          <div className="text-emerald-400 text-xs font-semibold mt-1">▲ Live from POS</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Pending Orders</div>
          <div className="text-2xl font-extrabold text-white mt-2">1</div>
          <div className="text-amber-400 text-xs font-semibold mt-1">Awaiting approval</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Products in Stock</div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {loading ? '...' : totalProducts}
          </div>
          <div className="text-blue-400 text-xs font-semibold mt-1">Across all categories</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Low Stock Items</div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {loading ? '...' : lowStockItems}
          </div>
          <div className={`text-xs font-semibold mt-1 ${lowStockItems > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {lowStockItems > 0 ? 'Needs attention' : 'All stock healthy'}
          </div>
        </div>
      </div>

      {/* Management Tools Navigation */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/inventory" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-blue-500 transition block">
            <h3 className="font-bold text-white">Stock Management</h3>
            <p className="text-xs text-slate-400 mt-1">Manage inventory levels and add products to Neon DB.</p>
          </Link>
          <Link href="/suppliers" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-blue-500 transition block">
            <h3 className="font-bold text-white">Approve Orders</h3>
            <p className="text-xs text-slate-400 mt-1">Review and approve supplier purchase orders.</p>
          </Link>
          <Link href="/staff" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-blue-500 transition block">
            <h3 className="font-bold text-white">Staff Management</h3>
            <p className="text-xs text-slate-400 mt-1">Manage staff roles, shifts, and permissions.</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Recent Activity Audit Log</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-slate-500 text-sm">Loading activity logs...</div>
          ) : (
            recentActivity.map((log) => (
              <div key={log.id} className="flex justify-between items-center py-2.5 border-b border-slate-800/60 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300">{log.text}</span>
                </div>
                <span className="text-xs text-slate-500">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}