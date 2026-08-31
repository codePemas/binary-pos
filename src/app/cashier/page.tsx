'use client';

import { useState } from 'react';

interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', barcode: '6001234567890', name: 'Forte Whole Milk 2L', category: 'Dairy', price: 32.99, stock: 45 },
  { id: '2', barcode: '6001234567891', name: 'White Bread 700g', category: 'Bakery', price: 16.50, stock: 8 },
  { id: '3', barcode: '6001234567892', name: 'Cheddar Cheese 500g', category: 'Dairy', price: 64.90, stock: 18 },
  { id: '4', barcode: '6001234567893', name: 'Sunflower Oil 2L', category: 'Pantry', price: 69.99, stock: 30 },
  { id: '5', barcode: '6001234567894', name: 'Maize Meal 5kg', category: 'Pantry', price: 59.99, stock: 4 },
];

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'CASH' | 'CARD'>('CASH');
  const [cashAmount, setCashAmount] = useState('');
  const [receipt, setReceipt] = useState<any | null>(null);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Out of stock: ${product.name}`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Limit reached. Only ${product.stock} units available.`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
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

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find(
      (p) => p.barcode === search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    );
    if (found) {
      addToCart(found);
      setSearch('');
    } else {
      alert('Product not found in Forte Supermarket inventory.');
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vat = subtotal * 0.15;
  const total = subtotal;
  const tendered = parseFloat(cashAmount) || 0;
  const change = tendered - total;

  const handleCompleteSale = () => {
    if (paymentType === 'CASH' && tendered < total) {
      alert('Tendered cash is insufficient!');
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        const item = cart.find((c) => c.id === p.id);
        return item ? { ...p, stock: p.stock - item.quantity } : p;
      })
    );

    setReceipt({
      id: `INV-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString(),
      items: [...cart],
      total,
      vat,
      paymentType,
      tendered: paymentType === 'CASH' ? tendered : total,
      change: paymentType === 'CASH' ? Math.max(0, change) : 0,
    });

    setCart([]);
    setCashAmount('');
    setPaymentModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Left Area: Product Catalogue */}
      <div className="w-7/12 p-6 flex flex-col border-r border-slate-800">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-wide text-blue-400">BINARY/Forte POS</h1>
            <p className="text-xs text-slate-400">Terminal 01 • Active Cashier</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
            Online
          </span>
        </header>

        <form onSubmit={handleBarcodeSubmit} className="mb-6">
          <input
            type="text"
            placeholder="Scan barcode or type item name..."
            className="w-full bg-slate-800 text-white placeholder-slate-500 p-4 rounded-xl border border-slate-700 text-lg focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </form>

        <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 flex-1">
          {products
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search))
            .map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left flex flex-col justify-between transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{product.category}</span>
                  <h3 className="font-semibold text-slate-200">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">BC: {product.barcode}</p>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <span className="text-lg font-bold text-emerald-400">R{product.price.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${product.stock < 10 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Right Area: Transaction Cart */}
      <div className="w-5/12 bg-slate-850 p-6 flex flex-col justify-between border-l border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">Active Cart</h2>
          <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-lg font-medium">Cart is empty</p>
                <p className="text-xs mt-1">Scan or select items to start</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-slate-200 text-sm">{item.name}</p>
                    <p className="text-xs text-emerald-400 font-semibold">R{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-slate-700 rounded font-bold">-</button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-slate-700 rounded font-bold">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-xs font-semibold ml-2">Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex justify-between text-slate-400 text-sm">
            <span>VAT (15%)</span>
            <span>R{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-3xl font-black text-white pt-2 border-t border-slate-700">
            <span>Total</span>
            <span className="text-emerald-400">R{total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => setPaymentModalOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-4 rounded-xl font-bold text-lg mt-2"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold text-white">Payment - R{total.toFixed(2)}</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentType('CASH')}
                className={`flex-1 py-3 rounded-xl font-bold ${paymentType === 'CASH' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                Cash
              </button>
              <button
                onClick={() => setPaymentType('CARD')}
                className={`flex-1 py-3 rounded-xl font-bold ${paymentType === 'CARD' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                Card
              </button>
            </div>

            {paymentType === 'CASH' && (
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-semibold">Tendered (ZAR)</label>
                <input
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-2xl font-bold text-white focus:outline-none"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  autoFocus
                />
                {tendered > 0 && (
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-slate-400">Change:</span>
                    <span className={`font-bold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      R{change >= 0 ? change.toFixed(2) : 'Insufficient'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button onClick={() => setPaymentModalOpen(false)} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold">
                Cancel
              </button>
              <button onClick={handleCompleteSale} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">
                Finalize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Overlay */}
      {receipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-900 p-6 rounded-2xl w-full max-w-sm font-mono text-xs space-y-4">
            <div className="text-center border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold uppercase">Forte Supermarket</h2>
              <p>Receipt: #{receipt.id}</p>
              <p className="text-[10px] text-slate-500">{receipt.timestamp}</p>
            </div>

            <div className="space-y-1.5 border-b pb-3 border-slate-200">
              {receipt.items.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.name.slice(0, 18)}</span>
                  <span>R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-b pb-3 border-slate-200">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>R{receipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>VAT (15%)</span>
                <span>R{receipt.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Method</span>
                <span>{receipt.paymentType}</span>
              </div>
            </div>

            <button
              onClick={() => setReceipt(null)}
              className="mt-4 w-full bg-slate-900 text-white py-2 rounded font-sans font-bold"
            >
              Close & Next Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}