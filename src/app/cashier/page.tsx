'use client';

import { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Printer,
  CheckCircle2,
  X,
  Receipt,
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface TransactionReceipt {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD';
  amountTendered: number;
  changeDue: number;
  cashierId: string;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: '2001', name: 'Fresh Milk 2L', category: 'Dairy', price: 34.99, stock: 45 },
  { id: '2', sku: '2002', name: 'White Bread 700g', category: 'Bakery', price: 18.50, stock: 60 },
  { id: '3', sku: '2003', name: 'Cheddar Cheese 500g', category: 'Dairy', price: 62.00, stock: 22 },
  { id: '4', sku: '2004', name: 'Instant Coffee 200g', category: 'Pantry', price: 89.99, stock: 18 },
  { id: '5', sku: '2005', name: 'White Rice 2kg', category: 'Pantry', price: 42.50, stock: 35 },
  { id: '6', sku: '2006', name: 'Sunflower Oil 2L', category: 'Pantry', price: 69.99, stock: 12 },
  { id: '7', sku: '2007', name: 'Eggs 30-Pack', category: 'Dairy', price: 74.99, stock: 15 },
  { id: '8', sku: '2008', name: 'Bananas 1kg', category: 'Produce', price: 21.99, stock: 40 },
];

export default function CashierPage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [completedReceipt, setCompletedReceipt] = useState<TransactionReceipt | null>(null);

  // Cart helper actions
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
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
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // Financial calculations (15% SA VAT)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.15;
  const total = subtotal;

  const tenderedAmount = paymentMethod === 'CARD' ? total : parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedAmount - total);
  const canCheckout = cart.length > 0 && (paymentMethod === 'CARD' || tenderedAmount >= total);

  // Process checkout & generate receipt
  const handleCheckout = () => {
    if (!canCheckout) return;

    const receipt: TransactionReceipt = {
      id: `FT-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }),
      items: [...cart],
      subtotal: subtotal - vat,
      vat,
      total,
      paymentMethod,
      amountTendered: tenderedAmount,
      changeDue,
      cashierId: '#4092',
    };

    setCompletedReceipt(receipt);
    setCart([]);
    setCashTendered('');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
      {/* Left Area: Product Search & Grid */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search items by name, category, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none text-sm placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex flex-col justify-between bg-slate-950 hover:bg-slate-800/80 p-4 rounded-2xl border border-slate-800 transition text-left group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                  <span>SKU: {product.sku}</span>
                  <span className="text-blue-400 font-semibold">{product.category}</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm group-hover:text-blue-400 transition">
                  {product.name}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-900">
                <span className="text-xs text-slate-400">Stock: {product.stock}</span>
                <span className="text-base font-bold text-emerald-400">
                  R {product.price.toFixed(2)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Cart & Checkout Panel */}
      <div className="lg:col-span-5 flex flex-col bg-slate-950 border border-slate-800 rounded-3xl p-5 justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100">Active Checkout Cart</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
                Cart is empty. Tap products to add to basket.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-slate-200">{item.name}</p>
                    <p className="text-slate-400 font-mono text-[10px]">
                      R {item.price.toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-bold text-white text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-emerald-400 w-16 text-right font-mono">
                      R {(item.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Summary & Action */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal (Excl. VAT)</span>
              <span className="font-mono font-semibold text-slate-300">
                R {(subtotal - vat).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VAT (15%)</span>
              <span className="font-mono font-semibold text-slate-300">
                R {vat.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800/80">
              <span>Total Amount Due</span>
              <span className="font-mono text-emerald-400">R {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition ${
                paymentMethod === 'CASH'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Banknote className="w-4 h-4" /> Cash Payment
            </button>
            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition ${
                paymentMethod === 'CARD'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card Terminal
            </button>
          </div>

          {/* Cash Tendered Input */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">
                Cash Tendered (R)
              </label>
              <input
                type="number"
                placeholder="Enter amount given by customer..."
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              {tenderedAmount > 0 && tenderedAmount >= total && (
                <p className="text-xs text-emerald-400 font-semibold text-right pt-1">
                  Change Due: R {changeDue.toFixed(2)}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={!canCheckout}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              canCheckout
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" /> Complete Sale & Print Receipt
          </button>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      {completedReceipt && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-slate-900 space-y-4">
            {/* Modal Header Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Sale Completed
              </span>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Content Body (Thermal Format) */}
            <div className="bg-white p-6 rounded-2xl shadow-inner font-mono text-xs text-black space-y-3">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
                <h2 className="font-bold text-base tracking-wider uppercase">
                  FORTE SUPERMARKET
                </h2>
                <p className="text-[10px] text-gray-600">Ocean Campus, Eastern Cape</p>
                <p className="text-[10px] text-gray-600">VAT Reg #: 4092001928</p>
              </div>

              <div className="text-[10px] text-gray-600 space-y-0.5 pb-2 border-b border-dashed border-gray-400">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span className="font-bold">{completedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date/Time:</span>
                  <span>{completedReceipt.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier ID:</span>
                  <span>{completedReceipt.cashierId}</span>
                </div>
              </div>

              {/* Items Line Items */}
              <div className="space-y-1 py-1 border-b border-dashed border-gray-400 text-[11px]">
                {completedReceipt.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate pr-2">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold">
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Excl. VAT:</span>
                  <span>R {completedReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (15%):</span>
                  <span>R {completedReceipt.vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 text-black border-t border-black">
                  <span>TOTAL PAID:</span>
                  <span>R {completedReceipt.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 pt-1">
                  <span>Method: {completedReceipt.paymentMethod}</span>
                  <span>Tendered: R {completedReceipt.amountTendered.toFixed(2)}</span>
                </div>
                {completedReceipt.paymentMethod === 'CASH' && (
                  <div className="flex justify-between text-[10px] font-bold text-gray-800">
                    <span>Change:</span>
                    <span>R {completedReceipt.changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-gray-400 text-[9px] text-gray-500">
                <p>Thank you for shopping at Forte!</p>
                <p>Please retain receipt for returns within 7 days.</p>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}