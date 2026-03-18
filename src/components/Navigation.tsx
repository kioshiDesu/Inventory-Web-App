'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/items', label: 'Items' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/reports', label: 'Reports' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="px-4 md:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight">Stock</span>
            </Link>
            <nav className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-[var(--color-bg)] text-[var(--color-text)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
