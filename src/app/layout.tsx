import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Package, Truck, LayoutDashboard } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forte Supermarket POS & ERP System',
  description: 'Enterprise point-of-sale and inventory management platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        {/* Navigation Bar */}
        <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              {/* Custom Logo Image */}
              <Image
                src="/logo.jpeg"
                alt="Forte Supermarket Logo"
                width={36}
                height={36}
                className="rounded-lg object-contain"
              />
              <div>
                <span className="font-bold text-slate-100 tracking-wide block leading-tight">
                  Binary Systems
                </span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block">
                  Forte Enterprise POS
                </span>
              </div>
            </div>

            <nav className="flex space-x-1 text-sm font-medium">
              <Link
                href="/cashier"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                <span>Cashier POS</span>
              </Link>
              <Link
                href="/inventory"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Inventory & Stock</span>
              </Link>
              <Link
                href="/suppliers"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Suppliers</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>Manager Reports</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-300">Terminal 01 • Active</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-200">Shift Operator</p>
              <p className="text-slate-400 text-[10px]">Staff ID: #4092</p>
            </div>
          </div>
        </header>

        {/* Main Application Area */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}