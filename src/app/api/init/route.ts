import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Create suppliers table
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create purchase orders table
    await sql`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        po_reference VARCHAR(50) UNIQUE NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        product_item VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        total_cost DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending Delivery',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return NextResponse.json({ message: 'Supplier and PO tables initialized successfully!' }, { status: 200 });
  } catch (error: any) {
    console.error('Table init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}