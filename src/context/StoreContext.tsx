'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'cashier' | 'manager';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  stock: number;
  minStock: number;
  supplier?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  category: string;
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
  status: 'PENDING' | 'DELIVERED';
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  points: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  overridePrice?: number;
}

export interface ReceiptData {
  receiptNo: string;
  date: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  tendered: number;
  change: number;
  paymentMethod: 'cash' | 'card';
}

export interface ShiftRecord {
  id: string;
  employeeName: string;
  start: string;
  end: string;
  initialFloat: number;
  cashSales: number;
  cardSales: number;
  totalSales: number;
  totals?: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
}

export interface User {
  name: string;
  pin: string;
  role: UserRole;
}

interface StoreSettings {
  storeName: string;
  address: string;
  currency: string;
}

interface StoreContextType {
  currentUser: User | null;
  activeRoleView: UserRole;
  loginWithPin: (pin: string) => boolean;
  verifyPin: (pin: string) => User | null;
  verifyManagerPin: (pin: string) => boolean;
  switchRoleWithPin: (pin: string, targetRole: UserRole) => boolean;
  logout: () => void;
  products: Product[];
  categories: string[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  customers: Customer[];
  activeShift: ShiftRecord | null;
  storeSettings: StoreSettings;
  updateStock: (sku: string, amount: number) => void;
  addProduct: (product: Product) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'status'>) => void;
  receivePurchaseOrder: (poId: string) => void;
  registerCustomer: (name: string, phone: string) => Customer;
  addCustomer: (customerData: { name: string; phone: string; points: number }) => Customer;
  openShift: (initialFloat: number) => void;
  startShift: (cashierName: string, initialFloat: number) => void;
  closeShift: (actualCash: number) => ShiftRecord;
  endShift: (actualCash: number) => ShiftRecord;
  addAuditLog: (action: string, managerName: string, details: string) => void;
  processSale: (
    cart: CartItem[],
    paymentMethod: 'cash' | 'card',
    tendered: number,
    discount: number,
    customerPhone?: string
  ) => ReceiptData | null;
  recordSale: (saleData: {
    cashierName: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'cash' | 'card';
    tendered: number;
    change: number;
    customerId?: string;
    pointsRedeemed?: number;
  }) => ReceiptData;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialUsers: User[] = [
  { name: 'Liyema Mthembu (Cashier)', pin: '1234', role: 'cashier' },
  { name: 'S. Ndlovu (Manager)', pin: '9999', role: 'manager' },
];

const initialProducts: Product[] = [
  { id: '1', sku: '2001', name: 'Fresh Milk 2L', category: 'Dairy', costPrice: 26.5, retailPrice: 34.99, stock: 54, minStock: 10, supplier: 'Clover SA' },
  { id: '2', sku: '2002', name: 'White Bread 700g', category: 'Bakery', costPrice: 12.0, retailPrice: 18.5, stock: 58, minStock: 10, supplier: 'Sasko Bakery' },
  { id: '3', sku: '2003', name: 'Cheddar Cheese 500g', category: 'Dairy', costPrice: 48.0, retailPrice: 62.0, stock: 57, minStock: 10, supplier: 'Clover SA' },
  { id: '4', sku: '2004', name: 'Instant Coffee 200g', category: 'Pantry', costPrice: 65.0, retailPrice: 89.99, stock: 55, minStock: 10, supplier: 'Nestlé Foods' },
  { id: '5', sku: '2005', name: 'White Rice 2kg', category: 'Pantry', costPrice: 30.0, retailPrice: 42.5, stock: 32, minStock: 10, supplier: 'Nestlé Foods' },
];

const initialSuppliers: Supplier[] = [
  { id: 'SUP-1', name: 'Clover SA', contactPerson: 'Sibusiso Dlamini', category: 'Dairy', email: 'orders@clover.co.za', phone: '+27 43 701 1000' },
  { id: 'SUP-2', name: 'Sasko Bakery', contactPerson: 'Nomsa Mbeki', category: 'Bakery', email: 'supply@sasko.co.za', phone: '+27 43 702 2200' },
  { id: 'SUP-3', name: 'Nestlé Foods', contactPerson: 'Johan Pretorius', category: 'Pantry', email: 'sales@nestle.co.za', phone: '+27 43 703 3300' },
];

const initialPOs: PurchaseOrder[] = [
  { id: 'PO-8801', supplierName: 'Clover SA', sku: '2001', productName: 'Fresh Milk 2L', quantity: 50, totalCost: 1200.0, status: 'DELIVERED' },
  { id: 'PO-8802', supplierName: 'Sasko Bakery', sku: '2002', productName: 'White Bread 700g', quantity: 30, totalCost: 345.0, status: 'PENDING' },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[1]);
  const [activeRoleView, setActiveRoleView] = useState<UserRole>('manager');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPOs);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'cust-1', name: 'Thabo Mokoena', phone: '0821234567', points: 25 },
  ]);

  const [activeShift, setActiveShift] = useState<ShiftRecord | null>({
    id: 'SHIFT-101',
    employeeName: 'S. Ndlovu (Manager)',
    start: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    end: '',
    initialFloat: 500,
    cashSales: 0,
    cardSales: 0,
    totalSales: 0,
    totals: 0,
    expectedCash: 500,
  });

  const [storeSettings] = useState<StoreSettings>({
    storeName: 'FORTE SUPERMARKET',
    address: 'University Road, Alice, Eastern Cape',
    currency: 'R',
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const loginWithPin = (pin: string) => {
    const user = initialUsers.find((u) => u.pin === pin);
    if (user) {
      setCurrentUser(user);
      setActiveRoleView(user.role);
      return true;
    }
    return false;
  };

  const verifyPin = (pin: string) => {
    return initialUsers.find((u) => u.pin === pin) || null;
  };

  const verifyManagerPin = (pin: string) => {
    if (pin === '9999') return true; // Default fallback manager PIN
    const user = initialUsers.find((u) => u.pin === pin);
    return !!user && user.role === 'manager';
  };

  const switchRoleWithPin = (pin: string, targetRole: UserRole) => {
    const user = initialUsers.find((u) => u.pin === pin);
    if (user && (user.role === 'manager' || user.role === targetRole)) {
      setActiveRoleView(targetRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRoleView('cashier');
  };

  const updateStock = (sku: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.sku === sku ? { ...p, stock: p.stock + amount } : p))
    );
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.sku === newProduct.sku);
      if (exists) return prev.map((p) => (p.sku === newProduct.sku ? newProduct : p));
      return [...prev, newProduct];
    });
  };

  const addSupplier = (newSup: Omit<Supplier, 'id'>) => {
    const supplierWithId: Supplier = {
      ...newSup,
      id: `SUP-${suppliers.length + 1}`,
    };
    setSuppliers((prev) => [...prev, supplierWithId]);
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'status'>) => {
    const newPo: PurchaseOrder = {
      ...poData,
      id: `PO-${8803 + purchaseOrders.length}`,
      status: 'PENDING',
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);
  };

  const receivePurchaseOrder = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId && po.status === 'PENDING') {
          updateStock(po.sku, po.quantity);
          return { ...po, status: 'DELIVERED' };
        }
        return po;
      })
    );
  };

  const registerCustomer = (name: string, phone: string) => {
    const existing = customers.find((c) => c.phone === phone);
    if (existing) return existing;

    const newCust: Customer = { id: `cust-${customers.length + 1}`, name, phone, points: 0 };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  const addCustomer = (customerData: { name: string; phone: string; points: number }) => {
    return registerCustomer(customerData.name, customerData.phone);
  };

  const openShift = (initialFloat: number) => {
    setActiveShift({
      id: `SHIFT-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: currentUser?.name || 'Cashier',
      start: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end: '',
      initialFloat,
      cashSales: 0,
      cardSales: 0,
      totalSales: 0,
      totals: 0,
      expectedCash: initialFloat,
    });
  };

  const startShift = (cashierName: string, initialFloat: number) => {
    setActiveShift({
      id: `SHIFT-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: cashierName,
      start: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end: '',
      initialFloat,
      cashSales: 0,
      cardSales: 0,
      totalSales: 0,
      totals: 0,
      expectedCash: initialFloat,
    });
  };

  const closeShift = (actualCash: number): ShiftRecord => {
    if (!activeShift) throw new Error('No active shift');

    const summary: ShiftRecord = {
      ...activeShift,
      end: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actualCash,
      variance: actualCash - activeShift.expectedCash,
      totals: activeShift.totalSales,
    };

    setActiveShift(null);
    return summary;
  };

  const endShift = (actualCash: number): ShiftRecord => closeShift(actualCash);

  const addAuditLog = (action: string, managerName: string, details: string) => {
    console.log(`[AUDIT LOG] ${action} by ${managerName}: ${details}`);
  };

  const processSale = (
    cart: CartItem[],
    paymentMethod: 'cash' | 'card',
    tendered: number,
    discount: number,
    customerPhone?: string
  ): ReceiptData | null => {
    const subtotal = cart.reduce((sum, i) => sum + (i.overridePrice ?? i.product.retailPrice) * i.quantity, 0);
    const total = Math.max(0, subtotal - discount);

    cart.forEach((i) => updateStock(i.product.sku, -i.quantity));

    if (customerPhone) {
      const earnedPoints = Math.floor(total / 10);
      setCustomers((prev) =>
        prev.map((c) =>
          c.phone === customerPhone
            ? { ...c, points: Math.max(0, c.points - discount + earnedPoints) }
            : c
        )
      );
    }

    if (activeShift) {
      setActiveShift((prev) => {
        if (!prev) return null;
        const isCash = paymentMethod === 'cash';
        const newTotal = prev.totalSales + total;
        return {
          ...prev,
          cashSales: prev.cashSales + (isCash ? total : 0),
          cardSales: prev.cardSales + (isCash ? 0 : total),
          totalSales: newTotal,
          totals: newTotal,
          expectedCash: prev.expectedCash + (isCash ? total : 0),
        };
      });
    }

    return {
      receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString(),
      cashierName: currentUser?.name || 'Cashier',
      items: cart,
      subtotal,
      discount,
      total,
      tendered: paymentMethod === 'cash' ? tendered : total,
      change: paymentMethod === 'cash' ? Math.max(0, tendered - total) : 0,
      paymentMethod,
    };
  };

  const recordSale = (saleData: {
    cashierName: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'cash' | 'card';
    tendered: number;
    change: number;
    customerId?: string;
    pointsRedeemed?: number;
  }): ReceiptData => {
    const receipt = processSale(
      saleData.items,
      saleData.paymentMethod,
      saleData.tendered,
      saleData.discount
    );
    if (receipt) return receipt;

    return {
      receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString(),
      cashierName: saleData.cashierName,
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      total: saleData.total,
      tendered: saleData.tendered,
      change: saleData.change,
      paymentMethod: saleData.paymentMethod,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activeRoleView,
        loginWithPin,
        verifyPin,
        verifyManagerPin,
        switchRoleWithPin,
        logout,
        products,
        categories,
        suppliers,
        purchaseOrders,
        customers,
        activeShift,
        storeSettings,
        updateStock,
        addProduct,
        addSupplier,
        createPurchaseOrder,
        receivePurchaseOrder,
        registerCustomer,
        addCustomer,
        openShift,
        startShift,
        closeShift,
        endShift,
        addAuditLog,
        processSale,
        recordSale,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}