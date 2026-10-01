'use client';

import { useState } from 'react';
import {
  Package,
  AlertTriangle,
  FilePlus,
  Search,
  ArrowUpRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minThreshold: number;
  supplier: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', sku: '2001', name: 'Fresh Milk 2L', category: 'Dairy', price: 34.99, costPrice: 26.50, stock: 45, minThreshold: 20, supplier: 'Clover SA' },
  { id: '2', sku: '2002', name: 'White Bread 700g', category: 'Bakery', price: 18.50, costPrice: 12.00, stock: 60, minThreshold: 25, supplier: 'Sasko Bakery' },
  { id: '3', sku: '2003', name: 'Cheddar Cheese 500g', category: 'Dairy', price: 62.00, costPrice: 48.00, stock: 8, minThreshold: 15, supplier: 'Parmalat' },
  { id: '4', sku: '2004', name: 'Instant Coffee 200g', category: 'Pantry', price: 89.99, costPrice: 65.00, stock: 5, minThreshold: 10, supplier: 'Nestlé Foods' },
  { id: '5', sku: '2005', name: 'White Rice 2kg', category: 'Pantry', price: 42.50, costPrice: 30.00, stock: 35, minThreshold: 20, supplier: 'Tastic Foods' },
  { id: '6', sku: '2006', name: 'Sunflower Oil 2L', category: 'Pantry', price: 69.99, costPrice: 52.00, stock: 4, minThreshold: 15, supplier: 'Excella Oil' },
  { id: '7', sku: '2007', name: 'Eggs 30-Pack', category: 'Dairy', price: 74.99, costPrice: 55.00, stock: 6, minThreshold: 12, supplier: 'Golden Lay' },
  { id: '8', sku: '2008', name: 'Bananas 1kg', category: 'Produce', price: 21.99, costPrice: 14.00, stock: 40, minThreshold: 15, supplier: 'Subtropico' },
];

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const categories = ['ALL', 'Dairy', 'Bakery', 'Pantry', 'Produce'];

  const lowStockItems = inventory.filter((item) => item.stock <= item.minThreshold);

  const handleGeneratePO = (item: InventoryItem) => {
    const newPO = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: item.supplier,
      itemDetails: `${item.name} (x50)`,
      totalCost: item.costPrice * 50,
      status: 'PENDING',
    };

    const existingPOs = JSON.parse(localStorage.getItem('forte_purchase_orders') || '[]');
    localStorage.setItem('forte_purchase_orders', JSON.stringify([newPO, ...existingPOs]));

    setActiveNotification(
      `Draft Purchase Order for ${item.supplier} (${item.name}) generated! View on the Suppliers page.`
    );
    setTimeout(() => setActiveNotification(null), 5000);
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.includes(searchQuery) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 p-6 space-y-6">
      {activeNotification && (
        <div className="fixed top-6 right-6 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{activeNotification}</span>
          <button onClick={() => setActiveNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total SKUs</p>
            <p className="text-2xl font-bold text-white mt-1">{inventory.length}</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Low Stock Warnings</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{lowStockItems.length} Items</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Quick Action</p>
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold mt-2"
            >
              Manage Supplier POs <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
            <FilePlus className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3 bg-slate-900 px-3 py-2 rounded-2xl border border-slate-800 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, item, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Cost Price</th>
                <th className="p-4">Retail Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Supplier</th>
                <th className="p-4 text-right">ERP Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredItems.map((item) => {
                const isLowStock = item.stock <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4 font-mono text-slate-400">{item.sku}</td>
                    <td className="p-4 font-semibold text-white">{item.name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono">R {item.costPrice.toFixed(2)}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      R {item.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                            isLowStock
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'text-slate-200'
                          }`}
                        >
                          {item.stock} units
                        </span>
                        {isLowStock && (
                          <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1 bg-red-950/60 px-2 py-0.5 rounded-md border border-red-800">
                            <AlertTriangle className="w-3 h-3" /> LOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{item.supplier}</td>
                    <td className="p-4 text-right">
                      {isLowStock ? (
                        <button
                          onClick={() => handleGeneratePO(item)}
                          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl font-semibold text-[11px] inline-flex items-center gap-1.5 transition"
                        >
                          <FilePlus className="w-3.5 h-3.5" /> Auto-Draft PO
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px] font-mono">Stock Optimal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}