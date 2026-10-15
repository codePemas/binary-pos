'use client';

import React, { useState, useMemo } from 'react';
import { useStore, Product, CartItem } from '@/context/StoreContext';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, DollarSign, CheckCircle, User, Award, X } from 'lucide-react';

export default function CashierPage() {
  const { products, categories, processSale, activeShift, customers } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Loyalty Customer Selection States
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.includes(searchQuery);
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filter customer list for till lookup
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    return (customers || []).filter(
      (c: any) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  // Add item to cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.sku === sku) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove item from cart
  const handleRemoveItem = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  // Clear entire sale
  const handleClearSale = () => {
    setCart([]);
    setTenderedAmount('');
    setDiscountAmount(0);
    setSelectedCustomer(null);
    setCustomerSearch('');
  };

  // Select customer & apply loyalty discount option
  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
    // Optional automatic 5% loyalty discount for registered members
    if (customer.points >= 100) {
      const autoDiscount = (cart.reduce((sum, item) => sum + (item.overridePrice ?? item.product.retailPrice) * item.quantity, 0) * 0.05);
      setDiscountAmount(Number(autoDiscount.toFixed(2)));
    }
  };

  // Calculations adhering to 15% VAT specifications
  const subtotal = cart.reduce((sum, item) => sum + (item.overridePrice ?? item.product.retailPrice) * item.quantity, 0);
  const vatAmount = subtotal * 0.15;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const numericTendered = parseFloat(tenderedAmount) || 0;
  const changeDue = paymentMethod === 'cash' ? Math.max(0, numericTendered - finalTotal) : 0;

  // Finalize payment and process sale
  const handleCompletePayment = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && numericTendered < finalTotal) {
      alert('Tendered cash is less than the total sale amount.');
      return;
    }

    const receipt = processSale(
      cart,
      paymentMethod,
      numericTendered,
      discountAmount,
      selectedCustomer?.id
    );

    if (receipt) {
      setLastReceipt({ ...receipt, customerName: selectedCustomer?.name || 'Walk-in Customer' });
      setShowReceiptModal(true);
      handleClearSale();
    }
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-6 h-screen overflow-hidden bg-slate-950 text-white">
      {/* Left Section: Product Search, Categories & Quick Picks */}
      <div className="col-span-8 flex flex-col space-y-4 h-full overflow-hidden">
        {/* Header Title */}
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            Point of Sale (POS) Terminal
          </h1>
          <p className="text-xs text-slate-400">Process customer purchases quickly and efficiently.</p>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid / Quick Picks */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-3 gap-3 content-start">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleAddToCart(product)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/50 cursor-pointer group transition-all"
            >
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="text-xs font-bold text-white mt-1 line-clamp-2 group-hover:text-blue-300">
                  {product.name}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-xs font-extrabold text-white">
                    R{product.retailPrice.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-slate-400">{product.stock} in stock</p>
                </div>
                <button className="bg-slate-800 group-hover:bg-blue-600 text-white p-2 rounded-xl transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Current Sale Cart & Summary */}
      <div className="col-span-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Current Sale</h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearSale}
              className="text-[10px] text-red-400 hover:underline font-bold"
            >
              Clear Sale
            </button>
          )}
        </div>

        {/* Integrated Customer Loyalty Search & Selection */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/30 relative">
          {!selectedCustomer ? (
            <div className="relative">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Lookup loyalty member (Phone or Name)..."
                  value={customerSearch}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  className="w-full bg-transparent text-white focus:outline-none text-[11px]"
                />
              </div>

              {/* Customer Search Dropdown */}
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 max-h-40 overflow-y-auto p-1 space-y-1">
                  {filteredCustomers.map((cust: any) => (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{cust.name}</p>
                        <p className="text-[10px] text-slate-400">{cust.phone}</p>
                      </div>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" /> {cust.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-950/40 border border-blue-800/50 rounded-xl p-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="font-bold text-white text-[11px]">{selectedCustomer.name}</p>
                  <p className="text-[10px] text-blue-300 font-mono flex items-center gap-1">
                    <Award className="w-2.5 h-2.5" /> {selectedCustomer.points} Loyalty Points
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setDiscountAmount(0);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <ShoppingCart className="w-8 h-8 opacity-40" />
              <p className="text-xs font-medium">No items added yet</p>
              <p className="text-[10px]">Select a product from the grid to begin a sale.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.sku}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{item.product.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    R{(item.overridePrice ?? item.product.retailPrice).toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleUpdateQuantity(item.product.sku, -1)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product.sku, 1)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product.sku)}
                    className="text-red-400 hover:text-red-300 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sale Summary Panel */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-white">R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>VAT (15%)</span>
              <span className="font-bold text-white">R{vatAmount.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Loyalty Discount</span>
                <span className="font-bold">-R{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-slate-800 text-white font-extrabold">
              <span>Total</span>
              <span>R{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                paymentMethod === 'cash'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> Cash
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                paymentMethod === 'card'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Card
            </button>
          </div>

          {/* Cash Tendered & Change Calculation */}
          {paymentMethod === 'cash' && (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">
                Cash Tendered (R)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={tenderedAmount}
                onChange={(e) => setTenderedAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
              />
              {numericTendered >= finalTotal && (
                <p className="text-[10px] text-green-400 font-semibold text-right">
                  Change: R{changeDue.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Complete Payment Button */}
          <button
            onClick={handleCompletePayment}
            disabled={cart.length === 0}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3 rounded-xl font-extrabold transition-colors shadow-lg shadow-green-600/20"
          >
            Complete Payment (R{finalTotal.toFixed(2)})
          </button>
        </div>
      </div>

      {/* Receipt Modal / Thermal View */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-6 w-96 space-y-4 shadow-2xl">
            <div className="text-center space-y-1 border-b pb-3">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
              <h3 className="font-extrabold text-sm">FORTE SUPERMARKET</h3>
              <p className="text-[10px] text-slate-500">University Road, Alice, Eastern Cape</p>
              <p className="text-[10px] font-mono text-slate-600 mt-1">{lastReceipt.receiptNo}</p>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Date: {lastReceipt.date}</span>
                <span>Customer: {lastReceipt.customerName}</span>
              </div>
            </div>

            <div className="border-t border-b py-2 space-y-1">
              {lastReceipt.items.map((item: CartItem, idx: number) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-bold">
                    R{((item.overridePrice ?? item.product.retailPrice) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1 font-semibold text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R{lastReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>VAT (15% incl.)</span>
                <span>R{(lastReceipt.subtotal * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-2 border-t">
                <span>Total</span>
                <span>R{lastReceipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                <span>Method: {lastReceipt.paymentMethod.toUpperCase()}</span>
                <span>Tendered: R{lastReceipt.tendered.toFixed(2)}</span>
              </div>
              {lastReceipt.paymentMethod === 'cash' && (
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Change</span>
                  <span>R{lastReceipt.change.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold"
            >
              New Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}