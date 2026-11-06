'use client';

import { useState, useEffect } from 'react';

interface Supplier {
  id: number;
  name: string;
  category: string;
  contact_person: string;
  email: string;
  phone: string;
}

interface PurchaseOrder {
  id: number;
  po_reference: string;
  supplier_name: string;
  product_item: string;
  quantity: number;
  total_cost: number;
  status: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  // Form states
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState('Dairy');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');

  const [poSupplier, setPoSupplier] = useState('');
  const [poItem, setPoItem] = useState('');
  const [poQty, setPoQty] = useState('');
  const [poCost, setPoCost] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Auto initialize tables first if needed
      await fetch('/api/suppliers/init');
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers);
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load supplier data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_supplier',
          name: supName,
          category: supCategory,
          contactPerson: supContact,
          email: supEmail,
          phone: supPhone,
        }),
      });
      if (res.ok) {
        setIsSupplierModalOpen(false);
        setSupName(''); setSupContact(''); setSupEmail(''); setSupPhone('');
        fetchData();
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  const handleRaisePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const poReference = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'raise_po',
          poReference,
          supplierName: poSupplier || (suppliers[0]?.name ?? 'Clover SA'),
          productItem: poItem,
          quantity: parseInt(poQty) || 10,
          totalCost: parseFloat(poCost) || 100.00,
        }),
      });
      if (res.ok) {
        setIsPoModalOpen(false);
        setPoItem(''); setPoQty(''); setPoCost('');
        fetchData();
      }
    } catch (err) {
      console.error('Error raising PO:', err);
    }
  };

  const handleRecordDelivery = async (poId: number, productItem: string, quantity: number) => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_delivery',
          poId,
          productItem,
          quantity,
        }),
      });
      if (res.ok) {
        alert(`Delivery recorded successfully! ${quantity} units added to ${productItem} stock.`);
        fetchData();
      }
    } catch (err) {
      console.error('Error recording delivery:', err);
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Supplier Orders & Delivery Management</h1>
          <p className="text-slate-400 text-sm">Manage purchase orders, approve requisitions, and record supplier deliveries.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg"
          >
            + Add Supplier
          </button>
          <button
            onClick={() => setIsPoModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg"
          >
            + Raise Purchase Order
          </button>
        </div>
      </div>

      {/* Active Purchase Orders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Active Purchase Orders</h2>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading purchase orders from database...</div>
        ) : orders.length === 0 ? (
          <div className="text-slate-500 text-sm py-4 text-center">No purchase orders found. Click "Raise Purchase Order" to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="pb-3">PO REFERENCE</th>
                  <th className="pb-3">SUPPLIER NAME</th>
                  <th className="pb-3">PRODUCT ITEM</th>
                  <th className="pb-3">QUANTITY</th>
                  <th className="pb-3">TOTAL COST</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-white">{po.po_reference}</td>
                    <td className="py-3 text-slate-300">{po.supplier_name}</td>
                    <td className="py-3 text-slate-300">{po.product_item}</td>
                    <td className="py-3 text-slate-300">{po.quantity} units</td>
                    <td className="py-3 text-slate-300">R{Number(po.total_cost).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        po.status === 'Received / Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {po.status !== 'Received / Delivered' ? (
                        <button
                          onClick={() => handleRecordDelivery(po.id, po.product_item, po.quantity)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Record Delivery
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold">COMPLETED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supermarket Suppliers Directory */}
      <div>
        <h2 className="text-lg font-bold mb-4">Supermarket Suppliers Directory</h2>
        {suppliers.length === 0 ? (
          <div className="text-slate-500 text-sm">No suppliers registered in database.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                  {sup.category}
                </span>
                <h3 className="font-bold text-white text-base">{sup.name}</h3>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <p>Contact: <span className="text-slate-200">{sup.contact_person || 'N/A'}</span></p>
                  <p>Email: <span className="text-slate-200">{sup.email}</span></p>
                  <p>Phone: <span className="text-slate-200">{sup.phone}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddSupplier} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white">Add New Supplier</h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Supplier Name</label>
              <input type="text" required value={supName} onChange={(e) => setSupName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm" placeholder="e.g. Nestlé SA" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select value={supCategory} onChange={(e) => setSupCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm">
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Pantry">Pantry</option>
                <option value="Beverages">Beverages</option>
                <option value="Produce">Produce</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Contact Person</label>
              <input type="text" value={supContact} onChange={(e) => setSupContact(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm" placeholder="e.g. Johan Pretorius" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email Address</label>
              <input type="email" required value={supEmail} onChange={(e) => setSupEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm" placeholder="e.g. orders@supplier.co.za" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input type="text" required value={supPhone} onChange={(e) => setSupPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm" placeholder="e.g. +27 43 703 3300" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs">Save Supplier</button>
            </div>
          </form>
        </div>
      )}

      {/* Raise PO Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRaisePO} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white">Raise Purchase Order</h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Supplier Name</label>
              <select value={poSupplier} onChange={(e) => setPoSupplier(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm">
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Product Item</label>
              <input type="text" required value={poItem} onChange={(e) => setPoItem(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm" placeholder="e.g. Fresh Milk 2L" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantity Units</label>
              <input type="number" required value={poQty} onChange={(e) => setPoQty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm" placeholder="e.g. 50" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Total Cost (R)</label>
              <input type="number" step="0.01" required value={poCost} onChange={(e) => setPoCost(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm" placeholder="e.g. 1200.00" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsPoModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs">Cancel</button>
              <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs">Submit PO</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}