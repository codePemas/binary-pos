import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, paymentMethod, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Loop through each item in the cart and deduct from Neon inventory
    for (const item of items) {
      await sql`
        UPDATE products 
        SET stock = GREATEST(0, stock - ${item.quantity})
        WHERE id = ${item.id};
      `;
    }

    // Optional: Log transaction or audit event
    console.log(`POS Checkout completed: R${total} paid via ${paymentMethod}. Stock deducted for ${items.length} items.`);

    return NextResponse.json({ success: true, message: 'Checkout processed and inventory updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('POS Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}