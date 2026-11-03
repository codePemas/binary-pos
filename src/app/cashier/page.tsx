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

interface CartItem extends Product {
  quantity: number;
}

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cashTendered, setCashTendered] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.retailPrice * item.quantity, 0);
  const vat = subtotal * 0.15; // 15% VAT
  const total = subtotal + vat;
  const cashNum = parseFloat(cashTendered) || 0;
  const change = cashNum >= total ? cashNum - total : 0;

  const handleCompletePayment = async () => {
    if (cart.length === 0) return;
    if (cashNum < total) {
      alert('Insufficient cash tendered.');
      return;
    }

    try {
      // Optional: send transaction to backend here or clear cart
      alert(`Payment successful! Change: R${change.toFixed(2)}`);
      setCart([]);
      setCashTendered('');
      await fetchProducts(); // Refresh stock levels
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const categories = ['All', 'Dairy', 'Bakery', 'Pantry', 'Beverages', 'Produce'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Left Area: Product Catalog */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Point of Sale (POS) Terminal</h1>
          <p className="text-slate-400 text-sm">Process customer purchases quickly and efficiently.</p>
        </div>

        {/* Search & Categories */}
        <div className="mb-4 space-y-3">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-slate-400">Loading catalog from database...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-slate-500 py-10 text-center">No products found. Add items via Inventory.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-blue-500 transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs uppercase text-blue-400 font-bold">{p.category}</span>
                  <h3 className="font-semibold text-white mt-1">{p.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">SKU: {p.sku}</div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
                  <span className="text-lg font-bold text-white">R{Number(p.retailPrice).toFixed(2)}</span>
                  <span className="text-xs text-slate-400">{p.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Area: Current Sale / Checkout Panel */}
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between p-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Current Sale</h2>
          
          {/* Cart Items List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-slate-500 text-center py-16 text-sm">
                No items added yet.<br />Select a product from the grid to begin a sale.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white text-sm">{item.name}</div>
                    <div className="text-xs text-slate-400">R{item.retailPrice.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 bg-slate-800 rounded text-slate-300 hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 bg-slate-800 rounded text-slate-300 hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Totals & Payment */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Subtotal</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>VAT (15%)</span>
            <span>R{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-800">
            <span>Total</span>
            <span>R{total.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">CASH TENDERED (R)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div className="flex justify-between text-sm text-emerald-400 font-semibold">
            <span>Change:</span>
            <span>R{change.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCompletePayment}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 rounded-xl transition shadow-lg"
          >
            Complete Payment (R{total.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
}