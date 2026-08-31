'use client';

import { useState } from 'react';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
}

interface PurchaseOrder {
  id: string;
  supplierName: string;
  itemDescription: string;
  quantityOrdered: number;
  totalCost: number;
  status: 'PENDING' | 'DELIVERED';
  orderDate: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Clover SA', contactPerson: 'Sibusiso Dlamini', email: 'orders@clover.co.za', phone: '+27 43 701 1000', category: 'Dairy' },
  { id: '2', name: 'Sasko Bakery', contactPerson: 'Nomsa Mbeki', email: 'supply@sasko.co.za', phone: '+27 43 702 2200', category: 'Bakery' },
  { id: '3', name: 'Tiger Brands', contactPerson: 'Johan Pretorius', email: 'sales@tigerbrands.com', phone: '+27 43 703 3300', category: 'Pantry' },
];

const INITIAL_ORDERS: PurchaseOrder[] = [
  { id: 'PO-8801', supplierName: 'Clover SA', itemDescription: 'Forte Whole Milk 2L (x50)', quantityOrdered: 50, totalCost: 1200.00, status: 'DELIVERED', orderDate: '2026-08-28' },
  { id: 'PO-8802', supplierName: 'Sasko Bakery', itemDescription: 'White Bread 700g (x30)', quantityOrdered: 30, totalCost: 345.00, status: 'PENDING', orderDate: '2026-08-30' },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_ORDERS);
  
  // Modal States
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);

  // Supplier Form State
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', email: '', phone: '', category: 'Dairy' });

  // PO Form State
  const [newPO, setNewPO] = useState({ supplierName: 'Clover SA', itemDescription: '', quantityOrdered: '', totalCost: '' });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    setSuppliers(prev => [...prev, { id: Date.now().toString(), ...newSupplier }]);
    setIsAddSupplierModalOpen(false);
    setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', category: 'Dairy' });
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    setOrders(prev => [
      {
        id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierName: newPO.supplierName,
        itemDescription: newPO.itemDescription,
        quantityOrdered: parseInt(newPO.quantityOrdered) || 0,
        totalCost: parseFloat(newPO.totalCost) || 0,
        status: 'PENDING',
        orderDate: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
    setIsCreatePOModalOpen(false);
    setNewPO({ supplierName: 'Clover SA', itemDescription: '', quantityOrdered: '', totalCost: '' });
  };

  const markAsDelivered = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'DELIVERED' } : o));
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Supplier & Purchasing Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Manage wholesale vendors and process stock restock purchase orders.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddSupplierModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            + New Supplier
          </button>
          <button
            onClick={() => setIsCreatePOModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/20"
          >
            + Create Purchase Order
          </button>
        </div>
      </div>

      {/* Supplier List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Active Suppliers</h2>
        <div className="grid grid-cols-3 gap-6">
          {suppliers.map(s => (
            <div key={s.id} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-white">{s.name}</h3>
                  <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-500/20">
                    {s.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Contact: {s.contactPerson}</p>
              </div>
              <div className="text-xs space-y-1 text-slate-300 font-mono pt-2 border-t border-slate-700/60">
                <p>📧 {s.email}</p>
                <p>📞 {s.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Purchase Orders & Deliveries</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Item Details</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-750/50">
                  <td className="p-4 font-mono text-slate-400 font-bold">{order.id}</td>
                  <td className="p-4 font-semibold text-white">{order.supplierName}</td>
                  <td className="p-4">{order.itemDescription}</td>
                  <td className="p-4 font-mono text-emerald-400 font-bold">R{order.totalCost.toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'PENDING' ? (
                      <button
                        onClick={() => markAsDelivered(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                      >
                        Receive Stock
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Supplier */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddSupplier} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-white">Register Supplier</h3>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Company Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                value={newSupplier.name}
                onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Contact Person</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                value={newSupplier.contactPerson}
                onChange={e => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newSupplier.email}
                  onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Phone</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newSupplier.phone}
                  onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button type="button" onClick={() => setIsAddSupplierModalOpen(false)} className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold text-sm">Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create Purchase Order */}
      {isCreatePOModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreatePO} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-white">Create Purchase Order</h3>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Supplier</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                value={newPO.supplierName}
                onChange={e => setNewPO({ ...newPO, supplierName: e.target.value })}
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Items Description</label>
              <input
                type="text"
                placeholder="e.g. Maize Meal 5kg (x40)"
                required
                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                value={newPO.itemDescription}
                onChange={e => setNewPO({ ...newPO, itemDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newPO.quantityOrdered}
                  onChange={e => setNewPO({ ...newPO, quantityOrdered: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Total Cost (ZAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:outline-none"
                  value={newPO.totalCost}
                  onChange={e => setNewPO({ ...newPO, totalCost: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button type="button" onClick={() => setIsCreatePOModalOpen(false)} className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold text-sm">Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">Submit PO</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}