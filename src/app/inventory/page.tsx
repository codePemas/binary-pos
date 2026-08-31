'use client';

import { useState } from 'react';

interface InventoryItem {
  id: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
}

interface WasteLog {
  id: string;
  productName: string;
  quantity: number;
  reason: 'EXPIRED' | 'DAMAGED' | 'STOLEN';
  date: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', barcode: '6001234567890', name: 'Forte Whole Milk 2L', category: 'Dairy', costPrice: 24.00, sellingPrice: 32.99, stock: 45, minStock: 15 },
  { id: '2', barcode: '6001234567891', name: 'White Bread 700g', category: 'Bakery', costPrice: 11.50, sellingPrice: 16.50, stock: 8, minStock: 10 },
  { id: '3', barcode: '6001234567892', name: 'Cheddar Cheese 500g', category: 'Dairy', costPrice: 48.00, sellingPrice: 64.90, stock: 18, minStock: 5 },
  { id: '4', barcode: '6001234567893', name: 'Sunflower Oil 2L', category: 'Pantry', costPrice: 52.00, sellingPrice: 69.99, stock: 30, minStock: 10 },
  { id: '5', barcode: '6001234567894', name: 'Maize Meal 5kg', category: 'Pantry', costPrice: 42.00, sellingPrice: 59.99, stock: 4, minStock: 8 },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [selectedItemForWaste, setSelectedItemForWaste] = useState<InventoryItem | null>(null);

  // New Item Form State
  const [newItem, setNewItem] = useState({
    barcode: '',
    name: '',
    category: 'Dairy',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    minStock: '',
  });

  // Waste Log Form State
  const [wasteQty, setWasteQty] = useState('1');
  const [wasteReason, setWasteReason] = useState<'EXPIRED' | 'DAMAGED' | 'STOLEN'>('EXPIRED');

  // Add Product Handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: InventoryItem = {
      id: Date.now().toString(),
      barcode: newItem.barcode,
      name: newItem.name,
      category: newItem.category,
      costPrice: parseFloat(newItem.costPrice) || 0,
      sellingPrice: parseFloat(newItem.sellingPrice) || 0,
      stock: parseInt(newItem.stock) || 0,
      minStock: parseInt(newItem.minStock) || 5,
    };

    setItems((prev) => [...prev, product]);
    setIsAddModalOpen(false);
    setNewItem({ barcode: '', name: '', category: 'Dairy', costPrice: '', sellingPrice: '', stock: '', minStock: '' });
  };

  // Stock Adjustment
  const adjustStock = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item))
    );
  };

  // Waste Log Handler
  const handleLogWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForWaste) return;

    const qty = parseInt(wasteQty) || 1;
    if (qty > selectedItemForWaste.stock) {
      alert('Waste quantity exceeds current stock level.');
      return;
    }

    // Deduct Stock
    adjustStock(selectedItemForWaste.id, -qty);

    // Record Log
    setWasteLogs((prev) => [
      {
        id: `WST-${Date.now().toString().slice(-4)}`,
        productName: selectedItemForWaste.name,
        quantity: qty,
        reason: wasteReason,
        date: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);

    setIsWasteModalOpen(false);
    setSelectedItemForWaste(null);
    setWasteQty('1');
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.barcode.includes(search);
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = items.filter((item) => item.stock <= item.minStock).length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Inventory & Stock Control</h1>
          <p className="text-sm text-slate-400 mt-1">Manage stock counts, pricing, and record damaged/expired goods.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/20"
        >
          + Add New Product
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total SKUs</p>
          <p className="text-3xl font-black text-white mt-1">{items.length}</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold uppercase">Low Stock Warnings</p>
          <p className={`text-3xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {lowStockCount} Items
          </p>
        </div>
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Stock Valuation</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">
            R{items.reduce((acc, i) => acc + i.sellingPrice * i.stock, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center bg-slate-850 p-4 rounded-2xl border border-slate-800">
        <input
          type="text"
          placeholder="Search by product name or barcode..."
          className="flex-1 bg-slate-900 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="bg-slate-900 text-slate-300 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="Dairy">Dairy</option>
          <option value="Bakery">Bakery</option>
          <option value="Pantry">Pantry</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs text-slate-400 uppercase font-semibold border-b border-slate-700">
            <tr>
              <th className="p-4">Barcode / Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Cost Price</th>
              <th className="p-4">Selling Price</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-750/50">
                <td className="p-4">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">BC: {item.barcode}</p>
                </td>
                <td className="p-4">
                  <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium">
                    {item.category}
                  </span>
                </td>
                <td className="p-4 font-mono text-slate-400">R{item.costPrice.toFixed(2)}</td>
                <td className="p-4 font-mono text-emerald-400 font-semibold">R{item.sellingPrice.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        item.stock <= item.minStock
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.stock} units
                    </span>
                    {item.stock <= item.minStock && (
                      <span className="text-[10px] text-amber-400 font-semibold">Low Stock</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => adjustStock(item.id, 5)}
                    className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-lg text-slate-200 font-semibold"
                  >
                    +5 Stock
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItemForWaste(item);
                      setIsWasteModalOpen(true);
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs px-3 py-1.5 rounded-lg font-semibold"
                  >
                    Log Waste
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Waste Audit Section */}
      {wasteLogs.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <h3 className="text-lg font-bold text-white">Recent Waste & Loss Logs</h3>
          <div className="space-y-2">
            {wasteLogs.map((log) => (
              <div key={log.id} className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-200">{log.productName}</span>
                  <span className="text-slate-500 ml-2">({log.date})</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">{log.reason}</span>
                  <span className="text-slate-300 font-semibold">Qty: {log.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddProduct} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-lg space-y-4">
            <h3 className="text-xl font-bold text-white">Add New Product</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Barcode</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newItem.barcode}
                  onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Category</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Cost Price (ZAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newItem.costPrice}
                  onChange={(e) => setNewItem({ ...newItem, costPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Selling Price (ZAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newItem.sellingPrice}
                  onChange={(e) => setNewItem({ ...newItem, sellingPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Initial Stock</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Waste Modal */}
      {isWasteModalOpen && selectedItemForWaste && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleLogWaste} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-white">Log Waste: {selectedItemForWaste.name}</h3>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Quantity to Remove</label>
              <input
                type="number"
                min="1"
                max={selectedItemForWaste.stock}
                required
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-lg text-white font-bold focus:outline-none"
                value={wasteQty}
                onChange={(e) => setWasteQty(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Reason</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm text-white focus:outline-none font-semibold"
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value as any)}
              >
                <option value="EXPIRED">Expired</option>
                <option value="DAMAGED">Damaged</option>
                <option value="STOLEN">Stolen / Discrepancy</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setIsWasteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm">
                Confirm & Record Loss
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}