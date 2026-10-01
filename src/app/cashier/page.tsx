'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Printer,
  X,
  CreditCard,
  Banknote,
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

interface CompletedSale {
  receiptNo: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD';
  amountTendered: number;
  changeDue: number;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', sku: '2001', name: 'Fresh Milk 2L', category: 'Dairy', price: 34.99, stock: 45 },
  { id: '2', sku: '2002', name: 'White Bread 700g', category: 'Bakery', price: 18.50, stock: 60 },
  { id: '3', sku: '2003', name: 'Cheddar Cheese 500g', category: 'Dairy', price: 62.00, stock: 8 },
  { id: '4', sku: '2004', name: 'Instant Coffee 200g', category: 'Pantry', price: 89.99, stock: 5 },
  { id: '5', sku: '2005', name: 'White Rice 2kg', category: 'Pantry', price: 42.50, stock: 35 },
  { id: '6', sku: '2006', name: 'Sunflower Oil 2L', category: 'Pantry', price: 69.99, stock: 4 },
  { id: '7', sku: '2007', name: 'Eggs 30-Pack', category: 'Dairy', price: 74.99, stock: 6 },
  { id: '8', sku: '2008', name: 'Bananas 1kg', category: 'Produce', price: 21.99, stock: 40 },
];

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('forte_inventory_items');
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
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

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vat = subtotal * 0.15; // 15% VAT
  const total = subtotal + vat;
  const tenderedNum = parseFloat(amountTendered) || 0;
  const changeDue = paymentMethod === 'CASH' ? Math.max(0, tenderedNum - total) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CASH' && tenderedNum < total) {
      alert('Tendered amount is less than total price!');
      return;
    }

    // Deduct stock levels locally & update localStorage
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((c) => c.id === prod.id);
      if (cartItem) {
        return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
      }
      return prod;
    });

    setProducts(updatedProducts);
    localStorage.setItem('forte_inventory_items', JSON.stringify(updatedProducts));

    // Record Completed Sale for thermal receipt modal
    const sale: CompletedSale = {
      receiptNo: `FT-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString('en-ZA'),
      items: [...cart],
      subtotal,
      vat,
      total,
      paymentMethod,
      amountTendered: paymentMethod === 'CASH' ? tenderedNum : total,
      changeDue,
    };

    setCompletedSale(sale);
    setCart([]);
    setAmountTendered('');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
      {/* Product Catalog & Search Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-2.5 rounded-2xl border border-slate-800 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search or scan barcode (SKU, Item Name)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                p.stock <= 0
                  ? 'opacity-40 bg-slate-950 border-slate-900 cursor-not-allowed'
                  : 'bg-slate-950 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex justify-between items-start text-[10px] font-mono text-slate-500">
                  <span>#{p.sku}</span>
                  <span className="text-slate-400 font-sans">{p.category}</span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1 line-clamp-2">{p.name}</h4>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900">
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  R {p.price.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    p.stock <= 5
                      ? 'bg-red-500/20 text-red-400 font-bold'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {p.stock} left
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between h-fit lg:min-h-[calc(100vh-3rem)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-400" /> Active Order Basket
            </h3>
            <span className="text-xs font-mono text-slate-400">{cart.length} items</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Basket is empty. Select products to begin.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      R {item.price.toFixed(2)} x {item.quantity} = R{' '}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-400 hover:text-red-300 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-4 pt-4 border-t border-slate-900 mt-4">
          <div className="space-y-1.5 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (15%):</span>
              <span>R {vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white font-sans pt-2 border-t border-slate-900">
              <span>Total Payable:</span>
              <span className="text-emerald-400 font-mono">R {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                paymentMethod === 'CASH'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4" /> Cash
            </button>
            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                paymentMethod === 'CARD'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">
                Amount Tendered
              </label>
              <input
                type="number"
                placeholder="e.g. 200"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              {tenderedNum > 0 && (
                <div className="flex justify-between text-xs font-mono pt-1 text-emerald-400 font-bold">
                  <span>Change Due:</span>
                  <span>R {changeDue.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition"
          >
            <CheckCircle className="w-4 h-4" /> Complete Sale & Issue Receipt
          </button>
        </div>
      </div>

      {/* Thermal Receipt Print Modal */}
      {completedSale && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex justify-between items-start border-b border-dashed border-gray-400 pb-3">
              <div>
                <h2 className="font-extrabold text-base tracking-wider uppercase text-gray-900">
                  FORTE SUPERMARKET
                </h2>
                <p className="text-[10px] text-gray-600">KuGompo, Eastern Cape</p>
                <p className="text-[10px] text-gray-600">VAT Reg #: 4920192837</p>
              </div>
              <button
                onClick={() => setCompletedSale(null)}
                className="text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[10px] text-gray-600 space-y-0.5">
              <p>Receipt #: {completedSale.receiptNo}</p>
              <p>Date: {completedSale.date}</p>
              <p>Payment: {completedSale.paymentMethod}</p>
            </div>

            <div className="border-t border-b border-dashed border-gray-400 py-3 space-y-2">
              {completedSale.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="truncate pr-2">
                    {item.name} (x{item.quantity})
                  </span>
                  <span className="font-bold">R {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R {completedSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[10px]">
                <span>VAT (15%):</span>
                <span>R {completedSale.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm border-t border-gray-300 pt-2">
                <span>TOTAL:</span>
                <span>R {completedSale.total.toFixed(2)}</span>
              </div>
              {completedSale.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-gray-600 text-[10px] pt-1">
                    <span>Tendered:</span>
                    <span>R {completedSale.amountTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-xs">
                    <span>Change:</span>
                    <span>R {completedSale.changeDue.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center text-[10px] text-gray-500 border-t border-dashed border-gray-400 pt-3 space-y-1">
              <p>Thank you for shopping at Forte Supermarket!</p>
              <p>Please keep this receipt for returns/refunds.</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-black text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-xl font-bold text-xs hover:bg-gray-300 transition"
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