'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useForm } from 'react-hook-form';
import { db } from '@/lib/db';
import { addTransaction } from '@/lib/inventory';
import { useToast } from '@/components/Toast';

type TransactionFormData = {
  type: 'sale' | 'purchase' | 'adjustment';
  itemId: number;
  quantity: number;
  unitPrice: number;
  note: string;
};

export default function TransactionsPage() {
  const transactions = useLiveQuery(() => 
    db.transactions.orderBy('timestamp').reverse().toArray()
  );
  const items = useLiveQuery(() => db.items.toArray());
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionFormData>();

  const selectedType = watch('type');
  const selectedItemId = watch('itemId');
  const selectedItem = items?.find(i => i.id === selectedItemId);

  const onSubmit = async (data: TransactionFormData) => {
    await addTransaction({
      type: data.type,
      itemId: data.itemId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      note: data.note,
    });
    showToast(`${data.type} recorded: $${(data.quantity * data.unitPrice).toFixed(2)}`);
    reset();
    setShowForm(false);
  };

  const getItemName = (itemId: number) => {
    const item = items?.find(i => i.id === itemId);
    return item?.name ?? 'Unknown';
  };

  const hasTransactions = transactions && transactions.length > 0;
  const hasItems = items && items.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-[var(--color-text-muted)]">
            {hasTransactions ? `${transactions.length} transactions recorded` : 'Record sales, purchases, and adjustments'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : 'New Transaction'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                {...register('type', { required: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              >
                <option value="sale">Sale</option>
                <option value="purchase">Purchase</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Item</label>
              <select
                {...register('itemId', { required: true, valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              >
                <option value="">Select item</option>
                {items?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Stock: {item.currentStock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                {...register('quantity', { required: true, valueAsNumber: true, min: 1 })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
              {errors.quantity && <span className="text-[var(--color-danger)] text-sm">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit Price {selectedType === 'sale' && selectedItem && `($${selectedItem.price})`}
              </label>
              <input
                type="number"
                step="0.01"
                {...register('unitPrice', { required: true, valueAsNumber: true })}
                defaultValue={selectedItem?.price ?? ''}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <input
                {...register('note')}
                placeholder="Add a note..."
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
          >
            Record Transaction
          </button>
        </form>
      )}

      {!hasItems && hasTransactions === false ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">No items to record transactions</h3>
          <p className="text-[var(--color-text-muted)] mt-1 mb-4">Add items first before recording transactions</p>
        </div>
      ) : !hasTransactions ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">No transactions yet</h3>
          <p className="text-[var(--color-text-muted)] mt-1 mb-4">Record your first sale, purchase, or adjustment</p>
          {hasItems && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
            >
              Record Transaction
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Unit</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-text-muted)] text-sm">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      tx.type === 'sale' ? 'bg-green-100 text-green-700' :
                      tx.type === 'purchase' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{getItemName(tx.itemId)}</td>
                  <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">{tx.quantity}</td>
                  <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">${tx.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold">${tx.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
