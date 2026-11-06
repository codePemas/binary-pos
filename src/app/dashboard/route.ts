import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch all products to calculate stock metrics
    const products = await sql`SELECT * FROM products ORDER BY id ASC`;

    const totalProducts = products.length;
    const lowStockItems = products.filter((p) => p.stock <= p.min_stock).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + Number(p.retail_price) * p.stock, 0);

    // 2. Mock audit logs or fetch from a database table if you have one
    const recentActivity = [
      { id: 1, text: 'System connected to Neon cloud database', time: 'Just now', type: 'success' },
      { id: 2, text: `Inventory synchronized (${totalProducts} items tracked)`, time: 'Today', type: 'info' },
      { id: 3, text: 'Manager dashboard stats loaded dynamically', time: 'Today', type: 'purple' },
    ];

    return NextResponse.json({
      todaySales: 18650.00, // Can be linked to a sales transactions table later
      pendingOrders: 1,
      totalProducts,
      lowStockItems,
      totalInventoryValue,
      recentActivity,
    }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}