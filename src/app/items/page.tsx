'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useForm } from 'react-hook-form';
import { db, Item } from '@/lib/db';
import { addItem, updateItem, deleteItem, addCategory } from '@/lib/inventory';
import { useToast } from '@/components/Toast';

type ItemFormData = {
  name: string;
  sku: string;
  categoryId: number;
  price: number;
  currentStock: number;
  reorderLevel: number;
};

export default function ItemsPage() {
  const items = useLiveQuery(() => db.items.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { showToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemFormData>();

  const onSubmit = async (data: ItemFormData) => {
    if (editingItem) {
      await updateItem(editingItem.id!, data);
      showToast('Item updated');
    } else {
      await addItem(data);
      showToast('Item added');
    }
    reset();
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    reset({
      name: item.name,
      sku: item.sku,
      categoryId: item.categoryId,
      price: item.price,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this item?')) {
      await deleteItem(id);
      showToast('Item deleted', 'info');
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowCategoryForm(false);
      showToast('Category created');
    }
  };

  const getCategoryName = (categoryId: number) => {
    const cat = categories?.find(c => c.id === categoryId);
    return cat?.name ?? '—';
  };

  const hasItems = items && items.length > 0;
  const hasCategories = categories && categories.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Items</h1>
          <p className="text-[var(--color-text-muted)]">{hasItems ? `${items.length} items in inventory` : 'Track your products'}</p>
        </div>
        <div className="flex gap-2">
          {!hasCategories && (
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="px-3 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-text-muted)] transition-colors"
            >
              Add Category
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              reset();
            }}
            className="px-3 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>
      </header>

      {showCategoryForm && (
        <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                {...register('name', { required: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
              {errors.name && <span className="text-[var(--color-danger)] text-sm">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                {...register('sku', { required: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                {...register('categoryId', { required: true, valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { required: true, valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Stock</label>
              <input
                type="number"
                {...register('currentStock', { required: true, valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reorder Level</label>
              <input
                type="number"
                {...register('reorderLevel', { required: true, valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
          >
            {editingItem ? 'Update Item' : 'Add Item'}
          </button>
        </form>
      )}

      {!hasItems ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">No items yet</h3>
          <p className="text-[var(--color-text-muted)] mt-1 mb-4">Add items to start tracking your inventory</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items?.map((item) => (
                <tr key={item.id} className={`hover:bg-[var(--color-bg)] transition-colors ${item.currentStock <= item.reorderLevel ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-sm">{item.sku}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{getCategoryName(item.categoryId)}</td>
                  <td className="px-4 py-3 text-right font-medium">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-full text-sm font-medium ${
                      item.currentStock <= item.reorderLevel 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-[var(--color-bg)]'
                    }`}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] text-sm mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
