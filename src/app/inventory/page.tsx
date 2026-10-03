'use client';

import React, { useState } from 'react';
import { useStore, Product } from '@/context/StoreContext';

export default function InventoryPage() {
  const {
    products,
    suppliers,
    updateStock,
    addProduct,
    createPurchaseOrder,
    storeSettings,
  } = useStore();

  const [filterLowStock, setFilterLowStock] = useState(false);

  // New Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newCost, setNewCost] = useState('');
  const [newRetail, setNewRetail] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newMinStock, setNewMinStock] = useState('10');
  const [newSupplier, setNewSupplier] = useState('');

  // Fast Reorder Modal State
  const [reorderProduct, setReorderProduct] = useState<Product | null>(null);
  const [reorderQty, setReorderQty] = useState('50');

  const displayedProducts = filterLowStock
    ? products.filter((p: Product) => p.stock <= p.minStock)
    : products;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || !newCost || !newRetail) return;

    addProduct({
      id: `prod-${Date.now()}`,
      sku: newSku.trim(),
      name: newName.trim(),
      category: newCategory.trim(),
      costPrice: parseFloat(newCost) || 0,
      retailPrice: parseFloat(newRetail) || 0,
      stock: parseInt(newStock) || 0,
      minStock: parseInt(newMinStock) || 10,
      supplier: newSupplier || (suppliers[0]?.name ?? 'Unassigned'),
    });

    setShowAddModal(false);
    setNewSku('');
    setNewName('');
    setNewCost('');
    setNewRetail('');
    setNewStock('');
  };

  const handleQuickReorder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reorderProduct) return;

    const targetSupplier = reorderProduct.supplier || suppliers[0]?.name || 'General Supplier';
    const qty = parseInt(reorderQty) || 10;
    const totalCost = qty * reorderProduct.costPrice;

    createPurchaseOrder({
      supplierName: targetSupplier,
      sku: reorderProduct.sku,
      productName: reorderProduct.name,
      quantity: qty,
      totalCost,
    });

    setReorderProduct(null);
    alert(`Purchase Order issued to ${targetSupplier} for ${qty}x ${reorderProduct.name}`);
  };

  return (
    <div className="p-8 space-y-6 bg-slate-950 text-slate-100 min-h-screen w-full">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Inventory Management</h1>
          <p className="text-xs text-slate-400">Track stock levels, configure thresholds, and initiate supplier restocks.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filterLowStock
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {filterLowStock ? 'Showing Low Stock Only' : 'Filter Low Stock'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-4">SKU</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Cost Price</th>
              <th className="p-4">Retail Price</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Supplier</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {displayedProducts.map((p: Product) => {
              const isLow = p.stock <= p.minStock;
              return (
                <tr key={p.id || p.sku} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-400">#{p.sku}</td>
                  <td className="p-4 font-bold text-white">{p.name}</td>
                  <td className="p-4">
                    <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[10px] text-slate-300 font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{storeSettings.currency} {p.costPrice.toFixed(2)}</td>
                  <td className="p-4 font-mono font-bold text-blue-400">{storeSettings.currency} {p.retailPrice.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold font-mono text-sm ${isLow ? 'text-amber-400' : 'text-slate-100'}`}>
                        {p.stock}
                      </span>
                      {isLow && (
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{p.supplier || 'Unassigned'}</td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => updateStock(p.sku, 5)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => updateStock(p.sku, 10)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => {
                        setReorderProduct(p);
                        setReorderQty('50');
                      }}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                    >
                      Reorder PO
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <form onSubmit={handleCreateProduct} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Add New Inventory Item</h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">SKU Code</label>
                <input
                  type="text"
                  required
                  placeholder="2006"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Category</label>
                <input
                  type="text"
                  required
                  placeholder="Dairy / Bakery"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Product Name</label>
              <input
                type="text"
                required
                placeholder="Full Product Description"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Cost Price ({storeSettings.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="25.00"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Retail Price ({storeSettings.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="35.00"
                  value={newRetail}
                  onChange={(e) => setNewRetail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Opening Stock</label>
                <input
                  type="number"
                  required
                  placeholder="50"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Assigned Supplier</label>
                <select
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Vendor...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-full bg-slate-800 text-xs py-2.5 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2.5 rounded-xl font-bold"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Reorder Modal */}
      {reorderProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <form onSubmit={handleQuickReorder} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-80 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Issue Restock PO</h3>
            <div className="text-xs space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-slate-400">Product: <strong className="text-white">{reorderProduct.name}</strong></p>
              <p className="text-slate-400">Supplier: <strong className="text-blue-400">{reorderProduct.supplier || suppliers[0]?.name}</strong></p>
              <p className="text-slate-400">Cost Price: <strong className="text-white">R{reorderProduct.costPrice.toFixed(2)}</strong></p>
            </div>

            <div className="text-xs">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Order Quantity</label>
              <input
                type="number"
                required
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReorderProduct(null)}
                className="w-full bg-slate-800 text-xs py-2 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-xl font-bold"
              >
                Create PO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}