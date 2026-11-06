import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const suppliers = await sql`SELECT * FROM suppliers ORDER BY id DESC`;
    const orders = await sql`SELECT * FROM purchase_orders ORDER BY id DESC`;
    return NextResponse.json({ suppliers, orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Add New Supplier
    if (action === 'add_supplier') {
      const { name, category, contactPerson, email, phone } = body;
      const result = await sql`
        INSERT INTO suppliers (name, category, contact_person, email, phone)
        VALUES (${name}, ${category}, ${contactPerson}, ${email}, ${phone})
        RETURNING *;
      `;
      return NextResponse.json({ success: true, supplier: result[0] }, { status: 201 });
    }

    // 2. Raise Purchase Order
    if (action === 'raise_po') {
      const { poReference, supplierName, productItem, quantity, totalCost } = body;
      const result = await sql`
        INSERT INTO purchase_orders (po_reference, supplier_name, product_item, quantity, total_cost, status)
        VALUES (${poReference}, ${supplierName}, ${productItem}, ${quantity}, ${totalCost}, 'Pending Delivery')
        RETURNING *;
      `;
      return NextResponse.json({ success: true, order: result[0] }, { status: 201 });
    }

    // 3. Record Delivery (Updates PO status AND increments product stock)
    if (action === 'record_delivery') {
      const { poId, productItem, quantity } = body;
      
      // Update PO status
      await sql`
        UPDATE purchase_orders SET status = 'Received / Delivered' WHERE id = ${poId};
      `;

      // Increment product stock in inventory
      await sql`
        UPDATE products SET stock = stock + ${quantity} WHERE name ILIKE ${'%' + productItem + '%'};
      `;

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Supplier API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}