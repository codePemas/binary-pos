'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  retailPrice: number;
  stock: number;
}

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load products in Cashier:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Point of Sale (POS) Terminal</h1>

      {loading ? (
        <div className="text-slate-400">Loading terminal products from Neon...</div>
      ) : products.length === 0 ? (
        <div className="text-slate-500">No products available in database. Add items in Inventory.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs uppercase text-blue-400 font-bold">{p.category}</span>
              <h3 className="font-semibold text-white mt-1">{p.name}</h3>
              <div className="flex justify-between items-center mt-3">
                <span className="text-lg font-bold text-white">R{Number(p.retailPrice).toFixed(2)}</span>
                <span className="text-xs text-slate-400">{p.stock} in stock</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}