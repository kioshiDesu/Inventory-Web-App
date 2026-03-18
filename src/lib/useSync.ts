'use client';

import { useState, useEffect } from 'react';
import { getSyncQueue, removeSyncItem, updateSyncItemAttempts } from './inventory';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncData();
    }
  }, [isOnline]);

  async function syncData() {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const queue = await getSyncQueue();
      
      for (const item of queue) {
        try {
          await pushToServer(item);
          await removeSyncItem(item.id!);
        } catch (error) {
          console.error('Sync failed for item:', item, error);
          await updateSyncItemAttempts(item.id!);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }

  async function pushToServer(queueItem: { entity: string; action: string; data: unknown }) {
    const response = await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changes: [{
          entity: queueItem.entity,
          action: queueItem.action,
          data: queueItem.data,
        }],
      }),
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }
  }

  return { isOnline, isSyncing, syncData };
}
