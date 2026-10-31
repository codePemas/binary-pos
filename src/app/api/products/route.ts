import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

async function initTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL DEFAULT 'General',
      retail_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      min_stock INT NOT NULL DEFAULT 10,
      supplier VARCHAR(255) NOT NULL DEFAULT 'General Supplier',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function GET() {
  try {
    await initTable();
    const products = await sql`SELECT * FROM products ORDER BY id ASC`;
    
    // Map database snake_case fields to camelCase for your UI components
    const formattedProducts = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      retailPrice: Number(p.retail_price),
      costPrice: Number(p.cost_price),
      stock: p.stock,
      minStock: p.min_stock,
      supplier: p.supplier,
      createdAt: p.created_at,
    }));

    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initTable();
    const body = await req.json();

    const sku = String(body.sku || '');
    const name = String(body.name || '');
    const category = String(body.category || 'General');
    const retailPrice = parseFloat(body.retailPrice ?? body.retail_price ?? 0) || 0;
    const costPrice = parseFloat(body.costPrice ?? body.cost_price ?? 0) || 0;
    const stock = parseInt(body.stock ?? body.initialStock ?? 0, 10) || 0;
    const minStock = parseInt(body.minStock ?? body.min_stock ?? 10, 10) || 10;
    const supplier = String(body.supplier || 'General Supplier');

    const result = await sql`
      INSERT INTO products (sku, name, category, retail_price, cost_price, stock, min_stock, supplier)
      VALUES (${sku}, ${name}, ${category}, ${retailPrice}, ${costPrice}, ${stock}, ${minStock}, ${supplier})
      RETURNING *
    `;

    const product = result[0];

    return NextResponse.json({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      retailPrice: Number(product.retail_price),
      costPrice: Number(product.cost_price),
      stock: product.stock,
      minStock: product.min_stock,
      supplier: product.supplier,
      createdAt: product.created_at,
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}