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
  CreditCard,
  Banknote,
  Award,
  UserPlus,
  UserCheck,
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

interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  lastVisit: string;
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
  customer?: Customer;
  pointsEarned: number;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', sku: '2001', name: 'Fresh Milk 2L', category: 'Dairy', price: 34.99, stock: 45 },
  { id: '2', sku: '2002', name: 'White Bread 700g', category: 'Bakery', price: 18.50, stock: 60 },
  { id: '3', sku: '2003', name: 'Cheddar Cheese 500g', category: 'Dairy', price: 62.00, stock: 8 },
  { id: '4', sku: '2004', name: 'Instant Coffee 200g', category: 'Pantry', price: 89.99, stock: 5 },
  { id: '5', sku: '2005', name: 'White Rice 2kg', category: 'Pantry', price: 42.50, stock: 35 },
  { id: '6', sku: '2006', name: 'Sunflower Oil 2L', category: 'Pantry', price: 69.99, stock: 4 },
];

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  // Customer Loyalty
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  useEffect(() => {
    const savedProducts = localStorage.getItem('forte_inventory_items');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }

    const savedCustomers = localStorage.getItem('forte_customers');
    if (savedCustomers) {
      try {
        setCustomers(JSON.parse(savedCustomers));
      } catch (e) {
        setCustomers([]);
      }
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
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const tenderedNum = parseFloat(amountTendered) || 0;
  const changeDue = paymentMethod === 'CASH' ? Math.max(0, tenderedNum - total) : 0;
  const pointsEarned = Math.floor(total / 10);

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCust: Customer = {
      id: Date.now().toString(),
      name: newCustName,
      phone: newCustPhone,
      points: 50,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0],
    };

    const updated = [newCust, ...customers];
    setCustomers(updated);
    localStorage.setItem('forte_customers', JSON.stringify(updated));
    setSelectedCustomer(newCust);

    setNewCustName('');
    setNewCustPhone('');
    setIsQuickRegisterOpen(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CASH' && tenderedNum < total) {
      alert('Tendered amount is less than total price!');
      return;
    }

    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((c) => c.id === prod.id);
      if (cartItem) {
        return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
      }
      return prod;
    });

    setProducts(updatedProducts);
    localStorage.setItem('forte_inventory_items', JSON.stringify(updatedProducts));

    if (selectedCustomer) {
      const updatedCustomers = customers.map((c) => {
        if (c.id === selectedCustomer.id) {
          return {
            ...c,
            points: c.points + pointsEarned,
            totalSpent: c.totalSpent + total,
            lastVisit: new Date().toISOString().split('T')[0],
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      localStorage.setItem('forte_customers', JSON.stringify(updatedCustomers));
    }

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
      customer: selectedCustomer || undefined,
      pointsEarned,
    };

    setCompletedSale(sale);
    setCart([]);
    setSelectedCustomer(null);
    setAmountTendered('');
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
      {/* Product Catalog */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items (SKU, Name, Category)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none font-mono"
          />
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
                  <span className="text-slate-400">{p.category}</span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1 line-clamp-2">{p.name}</h4>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900">
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  R {p.price.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md">
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
              <ShoppingCart className="w-4 h-4 text-blue-400" /> Active Basket
            </h3>
            <span className="text-xs font-mono text-slate-400">{cart.length} items</span>
          </div>

          {/* Customer Selection Section */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Loyalty Account
              </span>
              {selectedCustomer && (
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-[10px] text-red-400 hover:underline"
                >
                  Detach
                </button>
              )}
            </div>

            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> {selectedCustomer.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedCustomer.phone}</p>
                </div>
                <span className="text-xs font-bold font-mono text-amber-400">
                  {selectedCustomer.points} pts
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Lookup phone number or name..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                />

                {customerSearch && filteredCustomers.length > 0 && (
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch('');
                        }}
                        className="w-full text-left p-1.5 hover:bg-slate-900 rounded-lg text-xs flex justify-between items-center"
                      >
                        <span className="text-white font-bold">{c.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setIsQuickRegisterOpen(true)}
                  className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-400" /> Quick Register New Loyalty Customer
                </button>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Basket is empty.</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      R {item.price.toFixed(2)} x {item.quantity} = R{' '}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Checkout Summary & Payment Controls */}
        <div className="space-y-3 pt-3 border-t border-slate-900 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" /> Cash
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                paymentMethod === 'CARD'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Card / EFTPOS
            </button>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <label className="text-slate-400 font-bold">Amount Tendered (ZAR)</label>
                {tenderedNum >= total && total > 0 && (
                  <span className="text-emerald-400 font-mono font-bold">
                    Change: R {changeDue.toFixed(2)}
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                placeholder={`e.g. ${Math.ceil(total)}`}
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="space-y-1 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (15%):</span>
              <span>R {vat.toFixed(2)}</span>
            </div>
            {selectedCustomer && (
              <div className="flex justify-between text-amber-400 font-bold text-[11px]">
                <span>Loyalty Points to Earn:</span>
                <span>+{pointsEarned} pts</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white font-sans pt-2 border-t border-slate-900">
              <span>Total Payable:</span>
              <span className="text-emerald-400 font-mono">R {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              cart.length === 0 ||
              (paymentMethod === 'CASH' && (!amountTendered || tenderedNum < total))
            }
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <CheckCircle className="w-4 h-4" /> Complete Sale & Issue Receipt
          </button>
        </div>
      </div>

      {/* Quick Register Modal */}
      {isQuickRegisterOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-white">Quick Register Customer</h3>
            <form onSubmit={handleQuickRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sipho Zulu"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0820001122"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold">
                  Save & Attach (+50 Pts)
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickRegisterOpen(false)}
                  className="px-4 bg-slate-900 text-slate-400 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm space-y-4 font-mono text-xs">
            <div className="border-b border-dashed border-gray-400 pb-3">
              <h2 className="font-extrabold text-base tracking-wider uppercase">FORTE SUPERMARKET</h2>
              <p className="text-[10px] text-gray-600">KuGompo, Eastern Cape</p>
            </div>

            <div className="text-[10px] text-gray-600 space-y-0.5">
              <p>Receipt #: {completedSale.receiptNo}</p>
              <p>Date: {completedSale.date}</p>
              {completedSale.customer && (
                <p className="font-bold text-black">Customer: {completedSale.customer.name}</p>
              )}
            </div>

            <div className="border-t border-b border-dashed border-gray-400 py-3 space-y-2">
              {completedSale.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span className="font-bold">R {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-extrabold text-sm pt-1">
                <span>TOTAL:</span>
                <span>R {completedSale.total.toFixed(2)}</span>
              </div>
              {completedSale.customer && (
                <div className="flex justify-between text-[10px] text-gray-700 pt-1 font-bold">
                  <span>Points Earned This Sale:</span>
                  <span>+{completedSale.pointsEarned} pts</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-black text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="px-4 py-2 bg-gray-200 text-black rounded-xl font-bold text-xs"
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