export interface ShiftSession {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  expectedCash: number;
  actualCashCounted?: number;
  variance?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStockLevel: number;
  supplier: string;
}