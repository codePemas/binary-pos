'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  retailPrice: number;
  stock: number;
  minStock?: number;
  min_stock?: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRaisePO = async (product: Product) => {
    const defaultSupplier = 'Clover SA';
    const poReference = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const suggestedQty = 50;
    const estimatedCost = Number(product.retailPrice || 0) * 0.6 * suggestedQty;

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'raise_po',
          poReference,
          supplierName: defaultSupplier,
          productItem: product.name,
          quantity: suggestedQty,
          totalCost: estimatedCost,
        }),
      });

      if (res.ok) {
        alert(`✅ Purchase Order ${poReference} successfully raised for ${product.name} (${suggestedQty} units)!`);
      } else {
        alert('Failed to raise purchase order.');
      }
    } catch (err) {
      console.error('Error raising PO:', err);
      alert('Error connecting to procurement server.');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stock & Inventory Management</h1>
          <p className="text-slate-400 text-sm">Monitor stock levels, track thresholds, and raise purchase orders for depleted items.</p>
        </div>
        <div className="w-72">
          <input
            type="text"
            placeholder="Search inventory by name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Central Repository Stock Levels</h2>
        {loading ? (
          <div className="text-slate-500 text-sm py-8 text-center">Loading stock items from Neon database...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-slate-500 text-sm py-8 text-center">No products found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">PRODUCT NAME</th>
                  <th className="pb-3">CATEGORY</th>
                  <th className="pb-3">RETAIL PRICE</th>
                  <th className="pb-3">STOCK LEVEL</th>
                  <th className="pb-3">STATUS ALERT</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const minThreshold = p.minStock ?? p.min_stock ?? 10;
                  const isLowStock = p.stock <= minThreshold;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 text-xs text-slate-400 font-mono">{p.sku}</td>
                      <td className="py-3 font-semibold text-white">{p.name}</td>
                      <td className="py-3 text-slate-300">
                        <span className="text-[10px] uppercase font-bold bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-900">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">R{Number(p.retailPrice || 0).toFixed(2)}</td>
                      <td className="py-3 font-bold text-white">{p.stock} units</td>
                      <td className="py-3">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            🚨 OUT OF STOCK
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ⚠️ LOW STOCK WARNING
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✔ In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {(isLowStock || isOutOfStock) ? (
                          <button
                            onClick={() => handleRaisePO(p)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-lg flex items-center gap-1.5 ml-auto"
                          >
                            📦 Raise PO
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">Optimal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}