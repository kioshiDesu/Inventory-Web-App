import { db, Item, Transaction, Category, SyncQueueItem } from './db';

export type SyncAction = 'create' | 'update' | 'delete';
export type SyncEntity = 'items' | 'transactions' | 'categories';

export async function addToSyncQueue(
  entity: SyncEntity,
  action: SyncAction,
  data: unknown
) {
  await db.syncQueue.add({
    entity,
    action,
    data,
    attempts: 0,
    createdAt: new Date(),
  });
}

export async function getSyncQueue() {
  return await db.syncQueue.toArray();
}

export async function clearSyncQueue() {
  await db.syncQueue.clear();
}

export async function removeSyncItem(id: number) {
  await db.syncQueue.delete(id);
}

export async function updateSyncItemAttempts(id: number) {
  const item = await db.syncQueue.get(id);
  if (item) {
    await db.syncQueue.update(id, { attempts: item.attempts + 1 });
  }
}

export async function addItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();
  const newItem = {
    ...item,
    createdAt: now,
    updatedAt: now,
  };
  const id = await db.items.add(newItem as Item);
  await addToSyncQueue('items', 'create', { ...newItem, id });
  return id;
}

export async function updateItem(id: number, updates: Partial<Item>) {
  const now = new Date();
  await db.items.update(id, { ...updates, updatedAt: now });
  const item = await db.items.get(id);
  if (item) {
    await addToSyncQueue('items', 'update', item);
  }
}

export async function deleteItem(id: number) {
  await db.items.delete(id);
  await addToSyncQueue('items', 'delete', { id });
}

export async function addTransaction(
  tx: Omit<Transaction, 'id' | 'timestamp' | 'total'>
) {
  const now = new Date();
  const total = tx.quantity * tx.unitPrice;
  const newTx = {
    ...tx,
    total,
    timestamp: now,
  };
  const id = await db.transactions.add(newTx as Transaction);

  const item = await db.items.get(tx.itemId);
  if (item) {
    let newStock = item.currentStock;
    if (tx.type === 'sale') {
      newStock -= tx.quantity;
    } else if (tx.type === 'purchase') {
      newStock += tx.quantity;
    } else if (tx.type === 'adjustment') {
      newStock += tx.quantity;
    }
    await db.items.update(item.id!, { currentStock: newStock, updatedAt: now });
  }

  await addToSyncQueue('transactions', 'create', { ...newTx, id });
  return id;
}

export async function addCategory(name: string) {
  const now = new Date();
  const newCategory = {
    name,
    createdAt: now,
    updatedAt: now,
  };
  const id = await db.categories.add(newCategory as Category);
  await addToSyncQueue('categories', 'create', { ...newCategory, id });
  return id;
}

export async function getLowStockItems() {
  return await db.items
    .filter((item) => item.currentStock <= item.reorderLevel)
    .toArray();
}

export async function getRecentTransactions(limit = 10) {
  return await db.transactions
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getProfitLoss(startDate?: Date, endDate?: Date) {
  let query = db.transactions.toCollection();
  if (startDate) {
    query = query.filter((tx) => tx.timestamp >= startDate);
  }
  if (endDate) {
    query = query.filter((tx) => tx.timestamp <= endDate);
  }

  const transactions = await query.toArray();

  let revenue = 0;
  let cost = 0;

  for (const tx of transactions) {
    if (tx.type === 'sale') {
      revenue += tx.total;
    } else if (tx.type === 'purchase') {
      cost += tx.total;
    }
  }

  return {
    revenue,
    cost,
    profit: revenue - cost,
  };
}
