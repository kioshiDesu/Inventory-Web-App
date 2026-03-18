'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getLowStockItems, getRecentTransactions } from '@/lib/inventory';

export default function Dashboard() {
  const items = useLiveQuery(() => db.items.toArray());
  const lowStockItems = useLiveQuery(() => getLowStockItems());
  const recentTransactions = useLiveQuery(() => getRecentTransactions(5));
  const categories = useLiveQuery(() => db.categories.toArray());

  const totalItems = items?.length ?? 0;
  const totalStock = items?.reduce((sum, item) => sum + item.currentStock, 0) ?? 0;
  const totalValue = items?.reduce((sum, item) => sum + (item.price * item.currentStock), 0) ?? 0;

  const salesTotal = recentTransactions?.reduce((sum, t) => t.type === 'sale' ? sum + t.total : sum, 0) ?? 0;
  const purchasesTotal = recentTransactions?.reduce((sum, t) => t.type === 'purchase' ? sum + t.total : sum, 0) ?? 0;
  const profit = salesTotal - purchasesTotal;

  const hasData = totalItems > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Your inventory at a glance</p>
      </header>

      {!hasData ? (
        <div className="animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Get started with your inventory</h2>
            <p className="text-[var(--color-text-muted)] mt-2 mb-6 max-w-md mx-auto">
              Add your first items to start tracking stock, recording transactions, and generating reports.
            </p>
            <div className="flex gap-3 justify-center">
              <Link 
                href="/items" 
                className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-colors"
              >
                Add First Item
              </Link>
              <Link 
                href="/categories" 
                className="px-5 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] font-medium rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              >
                Create Category
              </Link>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <h3 className="font-semibold mb-2">1. Add categories</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Organize your items into categories like Electronics, Supplies, or Parts.</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <h3 className="font-semibold mb-2">2. Add items</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Create items with SKU, price, and stock levels. Set reorder points for alerts.</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <h3 className="font-semibold mb-2">3. Record transactions</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Track sales, purchases, and adjustments. Stock updates automatically.</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <h3 className="font-semibold mb-2">4. Review reports</h3>
              <p className="text-sm text-[var(--color-text-muted)]">See profit/loss, low stock alerts, and category breakdowns.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <div className="label mb-1">Net Profit</div>
              <div className="stat-value" style={{ color: profit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                ${profit.toFixed(2)}
              </div>
              <div className="mt-3 flex gap-6 text-sm">
                <div>
                  <span className="text-[var(--color-text-muted)]">Revenue</span>
                  <span className="ml-2 font-medium">${salesTotal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Costs</span>
                  <span className="ml-2 font-medium">${purchasesTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <div className="label mb-1">Total Items</div>
              <div className="stat-value">{totalItems}</div>
              <div className="mt-3 text-sm text-[var(--color-text-muted)]">
                {totalStock.toLocaleString()} units in stock
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="label mb-1">Inventory Value</div>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="label mb-1">Categories</div>
              <div className="text-2xl font-bold">{categories?.length ?? 0}</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="label mb-1">Low Stock</div>
              <div className="text-2xl font-bold" style={{ color: lowStockItems && lowStockItems.length > 0 ? 'var(--color-accent)' : 'inherit' }}>
                {lowStockItems?.length ?? 0}
              </div>
            </div>
          </div>

          {lowStockItems && lowStockItems.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="font-semibold text-amber-800">Items need reordering</h2>
              </div>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-amber-700">{item.name}</span>
                    <span className="text-amber-600 font-medium">{item.currentStock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
              <h2 className="section-title">Recent Activity</h2>
              <Link href="/transactions" className="text-sm text-[var(--color-primary)] hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {recentTransactions?.map((tx) => (
                <div key={tx.id} className="px-5 py-3 flex justify-between items-center hover:bg-[var(--color-bg)]">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      tx.type === 'sale' ? 'bg-green-100 text-green-700' :
                      tx.type === 'purchase' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="font-medium">{tx.quantity} × ${tx.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${tx.total.toFixed(2)}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {(!recentTransactions || recentTransactions.length === 0) && (
                <p className="p-5 text-center text-[var(--color-text-muted)]">No transactions yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
