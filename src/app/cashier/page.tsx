'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Product } from '@/context/StoreContext';
import {
  Lock,
  Search,
  User,
  Trash2,
  DollarSign,
  CreditCard,
  Printer,
  ShieldAlert,
  Plus,
  Minus,
  LogOut,
  Receipt,
  Scan,
} from 'lucide-react';

export default function CashierPage() {
  const {
    products,
    categories,
    customers,
    activeShift,
    storeSettings,
    startShift,
    endShift,
    addCustomer,
    recordSale,
    verifyManagerPin,
  } = useStore();

  const [cashierPin, setCashierPin] = useState('');
  const [loggedInCashier, setLoggedInCashier] = useState<{ id: string; name: string } | null>(null);
  const [pinError, setPinError] = useState('');

  const [initialFloatInput, setInitialFloatInput] = useState('');

  const [cart, setCart] = useState<{ product: Product; quantity: number; overridePrice?: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [phoneSearch, setPhoneSearch] = useState('');
  const [activeCustomer, setActiveCustomer] = useState<any | null>(null);
  const [notFoundAlert, setNotFoundAlert] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerPhoneInput, setRegisterPhoneInput] = useState('');
  const [registerNameInput, setRegisterNameInput] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashTendered, setCashTendered] = useState('');

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideAction, setOverrideAction] = useState<'void' | 'clear' | 'price' | null>(null);
  const [overrideTargetIndex, setOverrideTargetIndex] = useState<number | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');
  const [managerPinInput, setManagerPinInput] = useState('');
  const [overrideError, setOverrideError] = useState('');

  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualCash, setActualCash] = useState('');

  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [closedZReport, setClosedZReport] = useState<any | null>(null);

  useEffect(() => {
    let barcodeBuffer = '';
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.trim().length > 0) {
          const matchedProduct = products.find(
            (p) => p.sku.toLowerCase() === barcodeBuffer.trim().toLowerCase()
          );
          if (matchedProduct) {
            addToCart(matchedProduct);
          }
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          barcodeBuffer = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [products, cart]);

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashierPin === '1234' || cashierPin.length >= 4) {
      setLoggedInCashier({ id: 'cashier-1', name: 'Active Cashier' });
      setPinError('');
      setCashierPin('');
    } else {
      setPinError('Invalid Cashier PIN');
    }
  };

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    const float = parseFloat(initialFloatInput) || 0;
    startShift(loggedInCashier?.name || 'Cashier', float);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...item, quantity: newQty };
      }
      return updated;
    });
  };

  const handleOpenOverride = (action: 'void' | 'clear' | 'price', index: number | null = null) => {
    setOverrideAction(action);
    setOverrideTargetIndex(index);
    setManagerPinInput('');
    setNewPriceInput('');
    setOverrideError('');
    setShowOverrideModal(true);
  };

  const handleConfirmOverride = () => {
    if (!verifyManagerPin(managerPinInput)) {
      setOverrideError('Invalid Manager PIN');
      return;
    }

    if (overrideAction === 'void' && overrideTargetIndex !== null) {
      setCart((prev) => prev.filter((_, idx) => idx !== overrideTargetIndex));
    } else if (overrideAction === 'clear') {
      setCart([]);
      setActiveCustomer(null);
      setPointsToRedeem(0);
    } else if (overrideAction === 'price' && overrideTargetIndex !== null) {
      const priceVal = parseFloat(newPriceInput);
      if (!isNaN(priceVal) && priceVal >= 0) {
        setCart((prev) => {
          const updated = [...prev];
          updated[overrideTargetIndex] = {
            ...updated[overrideTargetIndex],
            overridePrice: priceVal,
          };
          return updated;
        });
      }
    }

    setShowOverrideModal(false);
  };

  const handleFindCustomer = () => {
    const found = customers.find((c) => c.phone.includes(phoneSearch.trim()));
    if (found) {
      setActiveCustomer(found);
      setNotFoundAlert(false);
    } else {
      setActiveCustomer(null);
      setNotFoundAlert(true);
    }
  };

  const handleOpenRegisterModal = () => {
    setRegisterPhoneInput(phoneSearch);
    setRegisterNameInput('');
    setShowRegisterModal(true);
  };

  const handleRegisterAndAttachCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerPhoneInput || !registerNameInput) return;
    const newCust = addCustomer({
      name: registerNameInput,
      phone: registerPhoneInput,
      points: 0,
    });
    setActiveCustomer(newCust);
    setShowRegisterModal(false);
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = item.overridePrice ?? item.product.retailPrice;
    return acc + price * item.quantity;
  }, 0);

  const discount = pointsToRedeem;
  const totalPayable = Math.max(0, subtotal - discount);
  const changeDue =
    paymentMethod === 'cash' && parseFloat(cashTendered) > totalPayable
      ? parseFloat(cashTendered) - totalPayable
      : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const receipt = recordSale({
      cashierName: loggedInCashier?.name || 'Cashier',
      items: cart,
      subtotal,
      discount,
      total: totalPayable,
      paymentMethod,
      tendered: paymentMethod === 'cash' ? parseFloat(cashTendered) || totalPayable : totalPayable,
      change: changeDue,
      customerId: activeCustomer?.id,
      pointsRedeemed: pointsToRedeem,
    });

    setActiveReceipt(receipt);

    setCart([]);
    setActiveCustomer(null);
    setPointsToRedeem(0);
    setCashTendered('');
    setPhoneSearch('');
  };

  const handleCloseShift = () => {
    const report = endShift(parseFloat(actualCash) || 0);
    setClosedZReport(report);
    setShowCloseShiftModal(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!loggedInCashier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] bg-slate-950 text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
              <Lock className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">Cashier Terminal</h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Enter your access PIN to unlock the point of sale
          </p>

          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={cashierPin}
                onChange={(e) => setCashierPin(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full text-center text-2xl font-mono tracking-widest bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>
            {pinError && (
              <p className="text-xs text-red-400 font-medium text-center">{pinError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!activeShift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] bg-slate-950 text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">Open Shift Required</h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Welcome, <span className="text-white font-semibold">{loggedInCashier.name}</span>. Enter the starting cash float to open the shift drawer.
          </p>

          <form onSubmit={handleStartShift} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Starting Cash Float (R)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={initialFloatInput}
                onChange={(e) => setInitialFloatInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-lg focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-600/20"
            >
              Open Shift Drawer
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
              <Scan className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Cashier Point of Sale</h1>
              <p className="text-xs text-slate-400">
                Shift active: <span className="text-emerald-400 font-medium">{loggedInCashier.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCloseShiftModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              End Shift (Z-Report)
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product by name or scan SKU/barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredProducts.map((p: Product) => (
            <div
              key={p.id || p.sku}
              onClick={() => addToCart(p)}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-3.5 rounded-xl flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">{p.sku}</p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-xs font-bold text-white font-mono">
                  R{p.retailPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Stock: {p.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Current Basket</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => handleOpenOverride('clear')}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Cart
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Basket is empty. Select items or scan barcodes to begin.
              </div>
            ) : (
              cart.map((item, idx) => {
                const currentPrice = item.overridePrice ?? item.product.retailPrice;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-white truncate">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          R{currentPrice.toFixed(2)}
                        </span>
                        {item.overridePrice !== undefined && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded">
                            Override
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenOverride('price', idx)}
                          className="text-[9px] text-blue-400 hover:underline"
                        >
                          Price
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="p-1 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-mono font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="p-1 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleOpenOverride('void', idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> Customer Loyalty
            </span>
            {activeCustomer && (
              <button
                onClick={() => {
                  setActiveCustomer(null);
                  setPointsToRedeem(0);
                }}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Detach
              </button>
            )}
          </div>

          {activeCustomer ? (
            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs font-bold text-blue-400">{activeCustomer.name}</p>
                <p className="text-[10px] text-slate-400">
                  {activeCustomer.phone} • {activeCustomer.points} pts
                </p>
              </div>
              {activeCustomer.points > 0 && (
                <button
                  onClick={() =>
                    setPointsToRedeem(Math.min(activeCustomer.points, subtotal))
                  }
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold transition-colors"
                >
                  Redeem R{Math.min(activeCustomer.points, subtotal).toFixed(2)}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Customer Phone..."
                  value={phoneSearch}
                  onChange={(e) => {
                    setPhoneSearch(e.target.value);
                    setNotFoundAlert(false);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleFindCustomer}
                  className="bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors"
                >
                  Find
                </button>
                <button
                  onClick={handleOpenRegisterModal}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors"
                >
                  + Register
                </button>
              </div>

              {notFoundAlert && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-medium">Customer not found</span>
                  <button
                    onClick={handleOpenRegisterModal}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-2 py-1 rounded transition-colors"
                  >
                    + Register
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                paymentMethod === 'cash'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> Cash
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                paymentMethod === 'card'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Card
            </button>
          </div>

          {paymentMethod === 'cash' && (
            <div>
              <input
                type="number"
                placeholder="Tendered Amount..."
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm font-mono text-blue-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Loyalty Discount:</span>
                <span>-R{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-slate-100 border-t border-slate-800 pt-1">
              <span>Total:</span>
              <span className="text-blue-400">R{totalPayable.toFixed(2)}</span>
            </div>
            {paymentMethod === 'cash' && changeDue > 0 && (
              <div className="flex justify-between text-xs text-amber-400 font-mono">
                <span>Change Due:</span>
                <span>R{changeDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-xs"
          >
            Process & Print Receipt
          </button>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleRegisterAndAttachCustomer}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4"
          >
            <h3 className="font-bold text-slate-100 text-sm">Register Customer for Rewards</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0821234567"
                  value={registerPhoneInput}
                  onChange={(e) => setRegisterPhoneInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Thabo Mokoena"
                  value={registerNameInput}
                  onChange={(e) => setRegisterNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-full bg-slate-800 text-xs py-2.5 rounded-xl text-slate-300 font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2.5 rounded-xl font-bold transition-colors"
              >
                Save & Attach
              </button>
            </div>
          </form>
        </div>
      )}

      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-xs space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Manager Override Required
            </h3>

            {overrideAction === 'price' && (
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  New Unit Price (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="New Price (R)..."
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                Manager PIN
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="Manager PIN..."
                value={managerPinInput}
                onChange={(e) => setManagerPinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center text-lg font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {overrideError && (
              <p className="text-[10px] text-red-400 font-bold text-center">{overrideError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="w-full bg-slate-800 text-xs py-2 rounded-xl text-slate-300 font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-xl font-bold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseShiftModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-100">End Shift & Reconcile (Z-Report)</h3>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                Opening Float: <strong>R{activeShift.initialFloat.toFixed(2)}</strong>
              </p>
              <p>
                Expected Drawer Cash: <strong>R{activeShift.expectedCash.toFixed(2)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                Actual Counted Cash (R)
              </label>
              <input
                type="number"
                step="0.01"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="Counted Cash Total..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="w-full bg-slate-800 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseShift}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                Close Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {activeReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            id="thermal-receipt-container"
            className="bg-white text-black p-6 rounded-2xl w-80 font-mono text-xs shadow-2xl space-y-3"
          >
            <div className="text-center border-b border-dashed border-gray-400 pb-2">
              <h2 className="font-bold text-base">{storeSettings.storeName}</h2>
              <p className="text-[10px] text-gray-600">{storeSettings.address}</p>
            </div>

            <div className="text-[10px] space-y-0.5">
              <p>Receipt: {activeReceipt.receiptNo}</p>
              <p>Date: {activeReceipt.date}</p>
              <p>Cashier: {activeReceipt.cashierName}</p>
            </div>

            <table className="w-full text-left border-t border-b border-dashed border-gray-400 py-1">
              <thead>
                <tr className="text-[10px]">
                  <th>QTY ITEM</th>
                  <th className="text-right">AMT</th>
                </tr>
              </thead>
              <tbody>
                {activeReceipt.items.map((i: any, idx: number) => (
                  <tr key={idx}>
                    <td>
                      {i.quantity}x {i.product.name}
                    </td>
                    <td className="text-right">
                      R
                      {(
                        (i.overridePrice ?? i.product.retailPrice) * i.quantity
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R{activeReceipt.subtotal.toFixed(2)}</span>
              </div>
              {activeReceipt.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span>-R{activeReceipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1">
                <span>TOTAL:</span>
                <span>R{activeReceipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Tendered ({activeReceipt.paymentMethod.toUpperCase()}):</span>
                <span>R{activeReceipt.tendered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>R{activeReceipt.change.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 print-hide">
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-full bg-gray-200 text-black py-2 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {closedZReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            id="thermal-receipt-container"
            className="bg-white text-black p-6 rounded-2xl w-80 font-mono text-xs shadow-2xl space-y-3"
          >
            <div className="text-center border-b border-dashed border-gray-400 pb-2">
              <h2 className="font-bold text-base">Z-REPORT / SHIFT CLOSE</h2>
              <p className="text-[10px] text-gray-600">{storeSettings.storeName}</p>
            </div>

            <div className="text-[10px] space-y-1">
              <p>Cashier: {closedZReport.employeeName}</p>
              <p>Shift ID: {closedZReport.id}</p>
              <p>
                Start: {closedZReport.start} | End: {closedZReport.end}
              </p>
            </div>

            <div className="border-t border-b border-dashed border-gray-400 py-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Opening Float:</span>
                <span>R{closedZReport.initialFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Sales:</span>
                <span>R{closedZReport.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Card Sales:</span>
                <span>R{closedZReport.cardSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Sales:</span>
                <span>R{(closedZReport.totals ?? closedZReport.totalSales ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Cash:</span>
                <span>R{closedZReport.expectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Actual Counted:</span>
                <span>R{(closedZReport.actualCash ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
                <span>Variance:</span>
                <span
                  className={
                    (closedZReport.variance || 0) < 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }
                >
                  R{(closedZReport.variance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 print-hide">
              <button
                onClick={() => setClosedZReport(null)}
                className="w-full bg-gray-200 text-black py-2 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print Z-Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}