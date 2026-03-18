'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getLowStockItems } from '@/lib/inventory';

export default function ReportsPage() {
  const items = useLiveQuery(() => db.items.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const lowStockItems = useLiveQuery(() => getLowStockItems());
  const transactions = useLiveQuery(() => db.transactions.toArray());

  const totalValue = items?.reduce((sum, item) => sum + (item.price * item.currentStock), 0) ?? 0;
  const totalItems = items?.length ?? 0;
  const lowStockCount = lowStockItems?.length ?? 0;

  const salesTotal = transactions?.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.total, 0) ?? 0;
  const purchasesTotal = transactions?.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.total, 0) ?? 0;
  const profit = salesTotal - purchasesTotal;

  const categoryBreakdown = categories?.map(cat => {
    const catItems = items?.filter(i => i.categoryId === cat.id) ?? [];
    const totalStock = catItems.reduce((sum, i) => sum + i.currentStock, 0);
    const totalVal = catItems.reduce((sum, i) => sum + (i.price * i.currentStock), 0);
    return { name: cat.name, itemCount: catItems.length, totalStock, totalValue: totalVal };
  }) ?? [];

  const hasData = totalItems > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-[var(--color-text-muted)]">Inventory analytics and insights</p>
      </header>

      {!hasData ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">No data yet</h3>
          <p className="text-[var(--color-text-muted)] mt-1">Add items and record transactions to see reports</p>
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

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="label mb-1">Inventory Value</div>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <div className="mt-2 text-sm text-[var(--color-text-muted)]">
                {totalItems} items across {categories?.length ?? 0} categories
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h2 className="section-title">Low Stock</h2>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {lowStockCount} items
                </span>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {lowStockItems?.map((item) => (
                  <div key={item.id} className="px-5 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">Reorder at {item.reorderLevel}</p>
                    </div>
                    <span className="px-2 py-1 text-sm font-medium bg-amber-100 text-amber-700 rounded">
                      {item.currentStock} left
                    </span>
                  </div>
                ))}
                {(!lowStockItems || lowStockItems.length === 0) && (
                  <p className="p-5 text-center text-[var(--color-text-muted)]">All items well-stocked</p>
                )}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h2 className="section-title">Categories</h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="px-5 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{cat.itemCount} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{cat.totalStock} units</p>
                      <p className="text-sm text-[var(--color-text-muted)]">${cat.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {categoryBreakdown.length === 0 && (
                  <p className="p-5 text-center text-[var(--color-text-muted)]">No categories</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="section-title">Transaction Summary</h2>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="label mb-1">Sales</p>
                <p className="text-xl font-bold text-green-700">${salesTotal.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {transactions?.filter(t => t.type === 'sale').length ?? 0} sales
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="label mb-1">Purchases</p>
                <p className="text-xl font-bold text-blue-700">${purchasesTotal.toFixed(2)}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {transactions?.filter(t => t.type === 'purchase').length ?? 0} purchases
                </p>
              </div>
              <div className="text-center p-4 bg-[var(--color-bg)] rounded-lg">
                <p className="label mb-1">Adjustments</p>
                <p className="text-xl font-bold">
                  {transactions?.filter(t => t.type === 'adjustment').length ?? 0}
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">adjustments</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
