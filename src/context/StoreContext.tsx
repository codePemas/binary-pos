'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = string;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
}

export interface Product {
  id?: number;
  sku: string;
  name: string;
  category: string;
  retailPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  supplier?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface PurchaseOrder {
  id: string;
  supplierName: string;
  sku: string;
  productName: string;
  quantity: number;
  totalCost: number;
  status: 'PENDING' | 'DELIVERED' | 'COMPLETED';
}

export interface CartItem {
  product: Product;
  quantity: number;
  overridePrice?: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  points: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  tendered: number;
  change: number;
  customerId?: number;
  cashierName: string;
}

interface StoreContextType {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  customers: Customer[];
  sales: Sale[];
  activeShift: any;
  categories: string[];
  storeSettings: any;
  currentUser: User;
  activeRoleView: string;

  addProduct: (product: Product) => Promise<void>;
  removeProduct: (sku: string) => Promise<void>;
  updateStock: (sku: string, delta: number) => void;
  addSupplier: (supplier: Supplier) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;
  addCustomer: (customer: any) => Promise<void>;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'status'>) => void;
  receivePurchaseOrder: (id: string) => void;
  processSale: (cart: CartItem[], paymentMethod: 'cash' | 'card', tendered: number, discount: number, customerId?: number) => Sale | null;
  startShift: (arg1: any, arg2?: any) => void;
  closeShift: (actualCash: number) => any;
  switchRoleWithPin: (pin: string, role?: string) => boolean;
  setActiveRoleView: (role: string) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialProducts: Product[] = [
  { id: 1, sku: '2001', name: 'Fresh Milk 2L', category: 'Dairy', retailPrice: 34.99, costPrice: 25.00, stock: 54, minStock: 10, supplier: 'Clover SA' },
  { id: 2, sku: '2002', name: 'White Bread 700g', category: 'Bakery', retailPrice: 18.50, costPrice: 12.00, stock: 58, minStock: 15, supplier: 'Sasko Bakery' },
  { id: 3, sku: '2003', name: 'Cheddar Cheese 500g', category: 'Dairy', retailPrice: 62.00, costPrice: 45.00, stock: 57, minStock: 10, supplier: 'Clover SA' },
  { id: 4, sku: '2004', name: 'Instant Coffee 200g', category: 'Pantry', retailPrice: 89.99, costPrice: 65.00, stock: 55, minStock: 12, supplier: 'Nestlé Foods' },
  { id: 5, sku: '2005', name: 'White Rice 2kg', category: 'Pantry', retailPrice: 42.50, costPrice: 30.00, stock: 32, minStock: 10, supplier: 'Nestlé Foods' },
];

const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Clover SA', category: 'Dairy', contactPerson: 'Sibusiso Dlamini', email: 'orders@clover.co.za', phone: '+27 43 701 1000' },
  { id: 'sup-2', name: 'Sasko Bakery', category: 'Bakery', contactPerson: 'Nomsa Mbeki', email: 'supply@sasko.co.za', phone: '+27 43 702 2200' },
  { id: 'sup-3', name: 'Nestlé Foods', category: 'Pantry', contactPerson: 'Johan Pretorius', email: 'sales@nestle.co.za', phone: '+27 43 703 3300' },
];

const initialPOs: PurchaseOrder[] = [
  { id: 'PO-8801', supplierName: 'Clover SA', sku: '2001', productName: 'Fresh Milk 2L', quantity: 50, totalCost: 1200.00, status: 'DELIVERED' },
  { id: 'PO-8802', supplierName: 'Sasko Bakery', sku: '2002', productName: 'White Bread 700g', quantity: 30, totalCost: 345.00, status: 'PENDING' },
];

const initialCustomers: Customer[] = [
  { id: 1, name: 'Sipho Ndlovu', phone: '0821234567', points: 120 },
  { id: 2, name: 'Ayo Balogun', phone: '0739876543', points: 45 },
];

const defaultUser: User = {
  id: 'USR-001',
  name: 'S. Ndlovu',
  role: 'manager',
  pin: '8888',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPOs);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [activeRoleView, setActiveRoleView] = useState('manager');

  const [activeShift, setActiveShift] = useState({
    id: 'SHIFT-101',
    employeeName: 'S. Ndlovu (Manager)',
    initialFloat: 500.00,
    cashSales: 0,
    cardSales: 0,
    totalSales: 0,
    expectedCash: 500.00,
  });

  const categories = ['All', 'Dairy', 'Bakery', 'Pantry', 'Beverages', 'Produce'];

  const storeSettings = {
    storeName: 'FORTE SUPERMARKET',
    address: 'University Road, Alice, Eastern Cape',
    currency: 'R',
    vatRate: 15,
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.warn('Falling back to local state:', err);
      }
    }
    loadProducts();
  }, []);

  const addProduct = async (product: Product) => {
    setProducts((prev) => [...prev, product]);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch (e) {
      console.error('Cloud save warning:', e);
    }
  };

  const removeProduct = async (sku: string) => {
    setProducts((prev) => prev.filter((p) => p.sku !== sku));
  };

  const updateStock = (sku: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.sku === sku ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
  };

  const addSupplier = async (supplier: Supplier) => {
    setSuppliers((prev) => [...prev, supplier]);
  };

  const removeSupplier = async (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const addCustomer = async (cust: any) => {
    const newCust: Customer = {
      id: cust.id || Date.now(),
      name: cust.name,
      phone: cust.phone,
      points: cust.points || 0,
    };
    setCustomers((prev) => [...prev, newCust]);
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'status'>) => {
    const newPo: PurchaseOrder = {
      ...poData,
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING',
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);
  };

  const receivePurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          updateStock(po.sku, po.quantity);
          return { ...po, status: 'DELIVERED' };
        }
        return po;
      })
    );
  };

  const processSale = (
    cart: CartItem[],
    paymentMethod: 'cash' | 'card',
    tendered: number,
    discount: number,
    customerId?: number
  ): Sale | null => {
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.overridePrice ?? item.product.retailPrice) * item.quantity,
      0
    );
    const total = Math.max(0, subtotal - discount);

    cart.forEach((item) => {
      updateStock(item.product.sku, -item.quantity);
    });

    if (customerId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, points: c.points + Math.floor(total / 10) } : c))
      );
    }

    if (activeShift) {
      setActiveShift((prev: any) => {
        const cashSales = paymentMethod === 'cash' ? prev.cashSales + total : prev.cashSales;
        const cardSales = paymentMethod === 'card' ? prev.cardSales + total : prev.cardSales;
        const totalSales = cashSales + cardSales;
        const expectedCash = paymentMethod === 'cash' ? prev.expectedCash + total : prev.expectedCash;

        return {
          ...prev,
          cashSales,
          cardSales,
          totalSales,
          expectedCash,
        };
      });
    }

    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString(),
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod,
      tendered,
      change: paymentMethod === 'cash' ? Math.max(0, tendered - total) : 0,
      customerId,
      cashierName: currentUser.name,
    };

    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const startShift = (arg1: any, arg2?: any) => {
    const isNameFirst = typeof arg1 === 'string';
    const employeeName = isNameFirst ? arg1 : (arg2 || currentUser.name);
    const initialFloat = isNameFirst ? (parseFloat(arg2) || 500) : (parseFloat(arg1) || 500);

    setActiveShift({
      id: `SHIFT-${Math.floor(100 + Math.random() * 900)}`,
      employeeName,
      initialFloat,
      cashSales: 0,
      cardSales: 0,
      totalSales: 0,
      expectedCash: initialFloat,
    });
  };

  const closeShift = (actualCash: number) => {
    if (!activeShift) return null;
    const variance = actualCash - activeShift.expectedCash;
    const summary = {
      ...activeShift,
      actualCash,
      variance,
    };
    setActiveShift(null as any);
    return summary;
  };

  const switchRoleWithPin = (pin: string, role?: string): boolean => {
    const cleanPin = String(pin).trim();
    const target = role ? String(role).trim().toLowerCase() : '';

    if (cleanPin === '8888' || target.includes('manager') || target.includes('admin') || target.includes('system')) {
      setCurrentUser({ id: 'USR-001', name: 'S. Ndlovu', role: 'manager', pin: '8888' });
      setActiveRoleView('manager');
      return true;
    }
    if (cleanPin === '1234' || target.includes('cashier')) {
      setCurrentUser({ id: 'USR-002', name: 'Cashier Staff', role: 'cashier', pin: '1234' });
      setActiveRoleView('cashier');
      return true;
    }
    if (cleanPin === '8888') {
      setCurrentUser({ id: 'USR-001', name: 'S. Ndlovu', role: 'manager', pin: '8888' });
      setActiveRoleView('manager');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(defaultUser);
    setActiveRoleView('manager');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        suppliers,
        purchaseOrders,
        customers,
        sales,
        activeShift,
        categories,
        storeSettings,
        currentUser,
        activeRoleView,
        addProduct,
        removeProduct,
        updateStock,
        addSupplier,
        removeSupplier,
        addCustomer,
        createPurchaseOrder,
        receivePurchaseOrder,
        processSale,
        startShift,
        closeShift,
        switchRoleWithPin,
        setActiveRoleView,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};