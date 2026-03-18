import Dexie, { Table } from 'dexie';

export interface Category {
  id?: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id?: number;
  name: string;
  sku: string;
  categoryId: number;
  price: number;
  currentStock: number;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: number;
  type: 'sale' | 'purchase' | 'adjustment';
  itemId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  note: string;
  timestamp: Date;
}

export interface SyncQueueItem {
  id?: number;
  entity: 'items' | 'transactions' | 'categories';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  attempts: number;
  createdAt: Date;
}

export class InventoryDatabase extends Dexie {
  categories!: Table<Category>;
  items!: Table<Item>;
  transactions!: Table<Transaction>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('InventoryDB');
    this.version(1).stores({
      categories: '++id, name, createdAt, updatedAt',
      items: '++id, sku, categoryId, name, createdAt, updatedAt',
      transactions: '++id, type, itemId, timestamp',
      syncQueue: '++id, entity, action, createdAt',
    });
  }
}

export const db = new InventoryDatabase();
