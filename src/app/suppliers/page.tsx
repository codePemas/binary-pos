'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Truck, CheckCircle, Clock, Plus, Package, Trash2, UserPlus, X } from 'lucide-react';

export default function SuppliersPage() {
  const { suppliers, purchaseOrders, createPurchaseOrder, receivePurchaseOrder, addSupplier, removeSupplier } = useStore();

  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || 'Clover SA');
  const [sku, setSku] = useState('2001');
  const [productName, setProductName] = useState('Fresh Milk 2L');
  const [quantity, setQuantity] = useState<number>(50);
  const [totalCost, setTotalCost] = useState<number>(1200);
  const [showNewPoModal, setShowNewPoModal] = useState(false);

  // New Supplier Modal State
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    category: 'Dairy',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    createPurchaseOrder({
      supplierName,
      sku,
      productName,
      quantity,
      totalCost,
    });
    setShowNewPoModal(false);
  };

  // Handle Add Supplier Submit
  const handleAddSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.contactPerson || !newSupplier.email) {
      alert('Please fill in required fields (Supplier Name, Contact Person, Email)');
      return;
    }

    if (addSupplier) {
      await addSupplier({
        id: Date.now().toString(),
        name: newSupplier.name,
        category: newSupplier.category,
        contactPerson: newSupplier.contactPerson,
        email: newSupplier.email,
        phone: newSupplier.phone || '+27 43 000 0000'
      });
    }

    setShowAddSupplierModal(false);
    setNewSupplier({ name: '', category: 'Dairy', contactPerson: '', email: '', phone: '' });
  };

  // Handle Delete Supplier
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove supplier "${name}"?`)) {
      if (removeSupplier) {
        await removeSupplier(id);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-slate-950 text-white min-h-screen">
      {/* Header with Actor Context */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Actors: Stock Controller, Store Manager & Supplier
            </span>
            <span className="text-xs text-slate-400 font-mono">Procurement & Deliveries</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Supplier Orders & Delivery Management</h1>
          <p className="text-xs text-slate-400">Manage purchase orders, approve requisitions, and record supplier deliveries.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-blue-400" /> Add Supplier
          </button>
          <button
            onClick={() => setShowNewPoModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> Raise Purchase Order
          </button>
        </div>
      </div>

      {/* Purchase Orders List (UC7, UC8, UC9) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" /> Active Purchase Orders
          </h2>
          <span className="text-xs text-slate-400 font-mono">{purchaseOrders.length} Total Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                <th className="pb-3">PO Reference</th>
                <th className="pb-3">Supplier Name</th>
                <th className="pb-3">Product Item</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Total Cost</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 font-mono font-bold text-white">{po.id}</td>
                  <td className="py-3 text-slate-300">{po.supplierName}</td>
                  <td className="py-3 text-white font-medium">
                    {po.productName} <span className="text-[10px] text-slate-400 font-mono">({po.sku})</span>
                  </td>
                  <td className="py-3 font-bold text-white">{po.quantity} units</td>
                  <td className="py-3 text-slate-200">R{po.totalCost.toFixed(2)}</td>
                  <td className="py-3">
                    {po.status === 'DELIVERED' || po.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        <CheckCircle className="w-3 h-3" /> Received / Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        <Clock className="w-3 h-3" /> Pending Delivery
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {po.status === 'PENDING' ? (
                      <button
                        onClick={() => receivePurchaseOrder(po.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Record Delivery
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supermarket Suppliers Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-400" /> Supermarket Suppliers Directory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id || sup.name} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{sup.name}</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">{sup.category}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Contact: <span className="text-white font-medium">{sup.contactPerson}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">{sup.email} | {sup.phone}</p>

              <button
                onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Remove Supplier"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-[440px] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" /> Add New Supplier
              </h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Supplier Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pioneer Foods"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Category</label>
                  <select
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Produce">Produce</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="orders@pioneer.co.za"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="+27 43 701 1000"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Purchase Order Modal */}
      {showNewPoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Raise New Purchase Order</h3>

            <form onSubmit={handleCreatePo} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Supplier Name</label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Product SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Quantity Ordered</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Total Cost (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalCost}
                    onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white mt-1 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewPoModal(false)}
                  className="w-full bg-slate-800 text-xs py-2.5 rounded-xl font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-xs py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  Submit Order for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}