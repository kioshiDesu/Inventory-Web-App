'use client';

import { useOnlineStatus } from '@/lib/useSync';

export function OnlineStatus() {
  const { isOnline, isSyncing } = useOnlineStatus();

  if (isOnline && !isSyncing) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${
        isOnline
          ? 'bg-blue-600 text-white'
          : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]'
      }`}
    >
      {isSyncing ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing changes...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          Offline — changes saved locally
        </span>
      )}
    </div>
  );
}
