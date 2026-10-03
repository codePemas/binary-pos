'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function SuppliersPage() {
  const {
    suppliers,
    purchaseOrders,
    products,
    addSupplier,
    createPurchaseOrder,
    receivePurchaseOrder,
    storeSettings,
  } = useStore();

  // New Supplier Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Create Purchase Order Modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [poQuantity, setPoQuantity] = useState('50');

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    addSupplier({
      name: supplierName.trim(),
      contactPerson: contactPerson.trim(),
      category: category.trim() || 'General',
      email: email.trim(),
      phone: phone.trim(),
    });

    setShowSupplierModal(false);
    setSupplierName('');
    setContactPerson('');
    setCategory('');
    setEmail('');
    setPhone('');
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.sku === selectedSku);
    if (!product || !selectedSupplier) return;

    const qty = parseInt(poQuantity) || 10;
    const totalCost = qty * product.costPrice;

    createPurchaseOrder({
      supplierName: selectedSupplier,
      sku: product.sku,
      productName: product.name,
      quantity: qty,
      totalCost,
    });

    setShowPOModal(false);
    setPoQuantity('50');
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Supplier & Purchasing Portal</h1>
          <p className="text-xs text-slate-400">Manage wholesale vendors and process stock restock purchase orders.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            + New Supplier
          </button>
          <button
            onClick={() => {
              if (suppliers.length > 0) setSelectedSupplier(suppliers[0].name);
              if (products.length > 0) setSelectedSku(products[0].sku);
              setShowPOModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            + Create Purchase Order
          </button>
        </div>
      </div>

      {/* Active Suppliers Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-[11px]">Active Suppliers</h2>
        <div className="grid grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-100">{sup.name}</h3>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                  {sup.category}
                </span>
              </div>
              <p className="text-xs text-slate-400">Contact: <span className="text-slate-200">{sup.contactPerson}</span></p>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-1 border-t border-slate-800/80">
                <p>✉ {sup.email}</p>
                <p>📞 {sup.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Orders & Deliveries Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <span>🚚</span> Purchase Orders & Deliveries
          </h2>
          <span className="text-xs font-mono text-slate-500">{purchaseOrders.length} Total Orders</span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">PO Number</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Item Details</th>
              <th className="p-3">Total Cost</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-slate-800/30">
                <td className="p-3 font-mono font-bold text-blue-400">{po.id}</td>
                <td className="p-3 font-bold text-slate-200">{po.supplierName}</td>
                <td className="p-3">{po.productName} (x{po.quantity})</td>
                <td className="p-3 font-mono font-bold text-emerald-400">
                  {storeSettings.currency} {po.totalCost.toFixed(2)}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      po.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {po.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {po.status === 'PENDING' ? (
                    <button
                      onClick={() => receivePurchaseOrder(po.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md"
                    >
                      📦 Receive Stock
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <form onSubmit={handleCreateSupplier} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-96 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Add New Wholesale Supplier</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parmalat SA"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Contact Representative</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Dairy"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Email</label>
                <input
                  type="email"
                  placeholder="orders@vendor.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Phone Number</label>
                <input
                  type="text"
                  placeholder="+27 43 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="w-full bg-slate-800 text-xs py-2 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-xl font-bold"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <form onSubmit={handleCreatePO} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-96 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Issue New Purchase Order</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Select Supplier</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Select Inventory Item</label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      #{p.sku} - {p.name} (Cost: R{p.costPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Quantity to Order</label>
                <input
                  type="number"
                  required
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPOModal(false)}
                className="w-full bg-slate-800 text-xs py-2 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-xl font-bold"
              >
                Issue Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}