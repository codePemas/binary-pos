'use client';

import React, { useState } from 'react';
import { useStore, PurchaseOrder } from '@/context/StoreContext';
import { Package, AlertTriangle, CheckCircle, Truck, Plus, Trash2, X } from 'lucide-react';

export default function StockControlPage() {
  const { products, purchaseOrders, receivePurchaseOrder, updateStock, addProduct, removeProduct } = useStore();

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [deliveryQty, setDeliveryQty] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);

  // New Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Dairy',
    retailPrice: '',
    costPrice: '',
    stock: '',
    minStock: '10',
    supplier: ''
  });

  // Filter pending purchase orders for delivery recording
  const pendingOrders = purchaseOrders.filter((po) => po.status === 'PENDING');

  const handleOpenDeliveryModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDeliveryQty(po.quantity);
    setShowDeliveryModal(true);
  };

  const handleConfirmDelivery = () => {
    if (!selectedPO) return;
    receivePurchaseOrder(selectedPO.id);
    setShowDeliveryModal(false);
    setSelectedPO(null);
  };

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name || !newProduct.retailPrice) {
      alert('Please fill in required fields (SKU, Name, Retail Price)');
      return;
    }

    const item = {
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category,
      retailPrice: parseFloat(newProduct.retailPrice) || 0,
      costPrice: parseFloat(newProduct.costPrice) || 0,
      stock: parseInt(newProduct.stock) || 0,
      minStock: parseInt(newProduct.minStock) || 10,
      supplier: newProduct.supplier || 'N/A',
    };

    try {
      // 1. Save directly to the Neon database via your API route
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!res.ok) {
        throw new Error('Failed to save to database');
      }

      const savedItem = await res.json();

      // 2. Update local context state
      if (addProduct) {
        await addProduct(savedItem);
      }

      setShowAddProductModal(false);
      setNewProduct({
        sku: '',
        name: '',
        category: 'Dairy',
        retailPrice: '',
        costPrice: '',
        stock: '',
        minStock: '10',
        supplier: '',
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product to database.');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (sku: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      if (removeProduct) {
        await removeProduct(sku);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-slate-950 text-white min-h-screen">
      {/* Header with Actor Context */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Actor: Stock Controller
            </span>
            <span className="text-xs text-slate-400 font-mono">Record Delivery & Expiry</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Stock Control Portal</h1>
          <p className="text-xs text-slate-400">Manage inventory levels, monitor low stock items, and process supplier deliveries.</p>
        </div>

        {/* Add Product Action Button */}
        <button
          onClick={() => setShowAddProductModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Add New Inventory Item
        </button>
      </div>

      {/* Pending Deliveries Section from Suppliers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" /> Pending Supplier Deliveries (Approved Orders)
          </h2>
          <span className="text-xs text-slate-400 font-mono">{pendingOrders.length} Pending</span>
        </div>

        {pendingOrders.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">No pending purchase orders awaiting delivery.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingOrders.map((po) => (
              <div key={po.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{po.id}</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold">
                      {po.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{po.productName} ({po.quantity} units)</p>
                  <p className="text-[10px] text-slate-400">Supplier: <span className="text-slate-200">{po.supplierName}</span></p>
                </div>
                <button
                  onClick={() => handleOpenDeliveryModal(po)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Record Delivery
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Inventory Table & Stock Levels */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" /> Inventory & Stock Levels
          </h2>
          <span className="text-xs text-slate-400 font-mono">{products.length} Products Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                <th className="pb-3">SKU & Item Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Supplier</th>
                <th className="pb-3">Stock Level</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {products.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                return (
                  <tr key={product.id || product.sku} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-3">
                      <span className="font-bold text-white block">{product.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>
                    </td>
                    <td className="py-3 text-slate-300">{product.category}</td>
                    <td className="py-3 text-slate-300">{product.supplier || 'N/A'}</td>
                    <td className="py-3 font-bold text-white">{product.stock} units</td>
                    <td className="py-3">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                          <CheckCircle className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          const amtStr = prompt(`Enter stock adjustment (+/-) for ${product.name}:`, '10');
                          if (amtStr) {
                            const amt = parseInt(amtStr, 10);
                            if (!isNaN(amt)) updateStock(product.sku, amt);
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Adjust Stock
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.sku, product.name)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-colors"
                        title="Remove Redundant Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-[480px] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> Add New Inventory Product
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">SKU / Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g. 2006"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Produce">Produce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Coca-Cola 2L"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Retail Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="24.99"
                    value={newProduct.retailPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, retailPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Cost Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="18.00"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Min Stock Threshold</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Coca-Cola SA"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Delivery Modal (UC7) */}
      {showDeliveryModal && selectedPO && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-96 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Record Delivery & Expiry</h3>
            <p className="text-xs text-slate-400">
              Confirming delivery for PO: <span className="font-bold text-white">{selectedPO.id}</span> ({selectedPO.productName})
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Quantity Received</label>
                <input
                  type="number"
                  value={deliveryQty}
                  onChange={(e) => setDeliveryQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Product Expiry Date (Required)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="w-full bg-slate-800 text-xs py-2.5 rounded-xl font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelivery}
                className="w-full bg-blue-600 hover:bg-blue-500 text-xs py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20"
              >
                Confirm & Update Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}