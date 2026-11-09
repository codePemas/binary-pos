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

interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
}

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Payment & Loyalty State
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'POINTS'>('CASH');
  const [cashTendered, setCashTendered] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  // Shift & Reconciliation State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [startingFloat, setStartingFloat] = useState('500.00');
  const [expectedCashSales, setExpectedCashSales] = useState(1450.00);
  const [expectedCardSales, setExpectedCardSales] = useState(890.00);
  const [actualCashCounted, setActualCashCounted] = useState('');
  const [shiftClosedReport, setShiftClosedReport] = useState<any | null>(null);

  const mockCustomers: Customer[] = [
    { id: '1', name: 'Sipho Ndlovu', phone: '0821234567', points: 150 },
    { id: '2', name: 'Nomsa Sithole', phone: '0739876543', points: 320 },
    { id: '3', name: 'Liyema Vanda', phone: '0610001122', points: 500 },
  ];

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

  const handleCustomerLookup = (query: string) => {
    setCustomerPhone(query);
    if (!query.trim()) {
      setSelectedCustomer(null);
      return;
    }
    const found = mockCustomers.find(
      (c) => c.phone.includes(query) || c.name.toLowerCase().includes(query.toLowerCase())
    );
    setSelectedCustomer(found || null);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Item is out of stock!');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot exceed available stock (${product.stock} units)`);
          return prev;
        }
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
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const cashNum = parseFloat(cashTendered) || 0;
  const change = paymentMethod === 'CASH' && cashNum >= total ? cashNum - total : 0;
  const earnedPoints = Math.floor(total / 10);

  const handleCompletePayment = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'CASH' && cashNum < total) {
      alert('Insufficient cash tendered!');
      return;
    }

    if (paymentMethod === 'POINTS') {
      if (!selectedCustomer) {
        alert('Please search and select a loyalty customer to redeem points!');
        return;
      }
      if (selectedCustomer.points < Math.ceil(total)) {
        alert(`Insufficient points! Customer has ${selectedCustomer.points} pts.`);
        return;
      }
    }

    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          total,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to process checkout on server');
      }

      const receiptData = {
        receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString(),
        cashier: 'S. Ndlovu (CASHIER)',
        customer: selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : 'Walk-in Customer',
        items: [...cart],
        subtotal,
        vat,
        total,
        paymentMethod,
        tendered: paymentMethod === 'CASH' ? cashNum : total,
        change: paymentMethod === 'CASH' ? change : 0,
        pointsEarned: selectedCustomer ? earnedPoints : 0,
        newPointsBalance: selectedCustomer
          ? paymentMethod === 'POINTS'
            ? selectedCustomer.points - Math.ceil(total)
            : selectedCustomer.points + earnedPoints
          : 0,
      };

      setActiveReceipt(receiptData);
      setCart([]);
      setCashTendered('');
      await fetchProducts();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error processing transaction. Please try again.');
    }
  };

  const handleReconcileShift = (e: React.FormEvent) => {
    e.preventDefault();
    const floatVal = parseFloat(startingFloat) || 0;
    const actualCash = parseFloat(actualCashCounted) || 0;
    const expectedTotalCashDrawer = floatVal + expectedCashSales;
    const variance = actualCash - expectedTotalCashDrawer;

    const report = {
      timestamp: new Date().toLocaleString(),
      cashier: 'S. Ndlovu',
      float: floatVal,
      expectedCash: expectedCashSales,
      expectedCard: expectedCardSales,
      expectedDrawerTotal: expectedTotalCashDrawer,
      actualCounted: actualCash,
      variance: variance,
      status: variance === 0 ? 'BALANCED' : variance > 0 ? 'OVER' : 'SHORT',
    };

    setShiftClosedReport(report);
  };

  const categories = ['All', 'Dairy', 'Bakery', 'Pantry', 'Beverages', 'Produce'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Left Catalog Area */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Point of Sale (POS) Terminal</h1>
            <p className="text-slate-400 text-sm">Process customer purchases, handle card/points, and issue receipts.</p>
          </div>
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg flex items-center gap-2"
          >
            🔒 Close Shift / Cash-Out
          </button>
        </div>

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
                  <span className={`text-xs ${p.stock <= 5 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                    {p.stock} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sale & Checkout Panel */}
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Current Sale</h2>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <label className="block text-xs text-slate-400 mb-1">LOYALTY MEMBER (Phone/Name)</label>
            <input
              type="text"
              placeholder="e.g. 0821234567 or Sipho"
              value={customerPhone}
              onChange={(e) => handleCustomerLookup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            {selectedCustomer ? (
              <div className="mt-2 text-xs text-emerald-400 flex justify-between font-medium">
                <span>👤 {selectedCustomer.name}</span>
                <span>⭐ {selectedCustomer.points} pts</span>
              </div>
            ) : customerPhone ? (
              <div className="mt-1 text-xs text-slate-500">No member found</div>
            ) : null}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-slate-500 text-center py-12 text-xs">
                No items in cart.<br />Tap any item on the left to add.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white text-xs">{item.name}</div>
                    <div className="text-[10px] text-slate-400">R{item.retailPrice.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-5 h-5 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-3 mt-4">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>VAT (15%)</span>
            <span>R{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
            <span>Total</span>
            <span>R{total.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">Payment Method</label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-1.5 rounded text-xs font-semibold transition ${
                  paymentMethod === 'CASH' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                💵 Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-1.5 rounded text-xs font-semibold transition ${
                  paymentMethod === 'CARD' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                💳 Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('POINTS')}
                className={`py-1.5 rounded text-xs font-semibold transition ${
                  paymentMethod === 'POINTS' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                ⭐ Points
              </button>
            </div>
          </div>

          {paymentMethod === 'CASH' && (
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">CASH TENDERED (R)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500 font-bold"
              />
              <div className="flex justify-between text-xs text-emerald-400 font-semibold mt-1">
                <span>Change:</span>
                <span>R{change.toFixed(2)}</span>
              </div>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 text-center">
              Card terminal ready. Present card or tap mobile device.
            </div>
          )}

          {paymentMethod === 'POINTS' && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 text-center">
              {selectedCustomer
                ? `Redeeming ${Math.ceil(total)} points from ${selectedCustomer.name}'s balance`
                : 'Lookup customer above to redeem points.'}
            </div>
          )}

          <button
            onClick={handleCompletePayment}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm"
          >
            Complete Payment (R{total.toFixed(2)})
          </button>
        </div>
      </div>

      {/* Shift Cash-Out / Reconciliation Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">🔒 Shift Cash-Out & Reconciliation</h2>
              <button onClick={() => { setIsShiftModalOpen(false); setShiftClosedReport(null); }} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {!shiftClosedReport ? (
              <form onSubmit={handleReconcileShift} className="space-y-4 text-sm">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Cash Sales:</span>
                    <span className="font-bold text-white">R{expectedCashSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Card Sales:</span>
                    <span className="font-bold text-white">R{expectedCardSales.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">STARTING TILL FLOAT (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={startingFloat}
                    onChange={(e) => setStartingFloat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ACTUAL PHYSICAL CASH COUNTED IN DRAWER (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Count notes and coins..."
                    value={actualCashCounted}
                    onChange={(e) => setActualCashCounted(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 font-bold text-emerald-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsShiftModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-xs"
                  >
                    Generate Reconciliation Report
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="text-center border-b border-slate-800 pb-2 font-bold text-white text-sm">
                    SHIFT CLOSING REPORT
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cashier:</span>
                    <span>{shiftClosedReport.cashier}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Time:</span>
                    <span>{shiftClosedReport.timestamp}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                    <span>Starting Float:</span>
                    <span>R{shiftClosedReport.float.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Cash:</span>
                    <span>R{shiftClosedReport.expectedCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Drawer Total:</span>
                    <span>R{shiftClosedReport.expectedDrawerTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Actual Counted:</span>
                    <span>R{shiftClosedReport.actualCounted.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-slate-800 text-sm">
                    <span>VARIANCE:</span>
                    <span className={shiftClosedReport.variance === 0 ? 'text-emerald-400' : 'text-red-400'}>
                      R{shiftClosedReport.variance.toFixed(2)} ({shiftClosedReport.status})
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs"
                  >
                    🖨️ Print Report
                  </button>
                  <button
                    onClick={() => {
                      setIsShiftModalOpen(false);
                      setShiftClosedReport(null);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs"
                  >
                    Close & Lock Terminal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black rounded-xl p-6 w-full max-w-sm shadow-2xl font-mono text-xs space-y-4">
            <div className="text-center border-b border-black pb-3">
              <h2 className="text-lg font-bold">FORTE SUPERMARKET</h2>
              <p>University Road, Alice</p>
              <p>Tel: 040 602 2000 | VAT: 4900123456</p>
              <div className="mt-2 text-[10px] text-gray-600">
                <p>Receipt: {activeReceipt.receiptNo}</p>
                <p>Date: {activeReceipt.date}</p>
                <p>Cashier: {activeReceipt.cashier}</p>
                <p>Customer: {activeReceipt.customer}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold border-b border-gray-300 pb-1">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>TOTAL</span>
              </div>
              {activeReceipt.items.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate max-w-[120px]">{item.name}</span>
                  <span>{item.quantity} x R{item.retailPrice.toFixed(2)}</span>
                  <span>R{(item.quantity * item.retailPrice).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-black pt-2 space-y-1">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>R{activeReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%)</span>
                <span>R{activeReceipt.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-gray-400 pt-1">
                <span>TOTAL</span>
                <span>R{activeReceipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 text-gray-700">
                <span>PAYMENT METHOD</span>
                <span>{activeReceipt.paymentMethod}</span>
              </div>
              {activeReceipt.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-gray-700">
                    <span>TENDERED</span>
                    <span>R{activeReceipt.tendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 font-bold">
                    <span>CHANGE</span>
                    <span>R{activeReceipt.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {activeReceipt.pointsEarned > 0 && (
              <div className="border-t border-dashed border-gray-400 pt-2 text-center text-[10px] text-gray-700">
                <p>⭐ Points Earned Today: +{activeReceipt.pointsEarned}</p>
                <p>New Total Points Balance: {activeReceipt.newPointsBalance} pts</p>
              </div>
            )}

            <div className="text-center border-t border-black pt-3">
              <p className="font-bold">THANK YOU FOR SHOPPING WITH US!</p>
              <p className="text-[9px] text-gray-500">Please keep receipt as proof of purchase.</p>
            </div>

            <div className="flex gap-2 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-black text-white font-bold py-2 rounded text-xs hover:bg-gray-800"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="flex-1 bg-gray-200 text-black font-bold py-2 rounded text-xs hover:bg-gray-300"
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