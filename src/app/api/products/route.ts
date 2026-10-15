import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch products from Neon DB
export async function GET() {
  try {
    const result = await query('SELECT * FROM products ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add new product to Neon DB
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sku, name, category, retailPrice, costPrice, stock, minStock, supplier } = body;

    const sql = `
      INSERT INTO products (sku, name, category, retail_price, cost_price, stock, min_stock, supplier)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      sku,
      name,
      category,
      parseFloat(retailPrice),
      parseFloat(costPrice),
      parseInt(stock, 10),
      parseInt(minStock, 10),
      supplier || 'General Supplier',
    ];

    const result = await query(sql, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}