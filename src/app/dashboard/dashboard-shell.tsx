'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardShellProps {
  name: string;
  role: string;
  children: React.ReactNode;
}

export function DashboardShell({ name, role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { href: '/dashboard', label: 'Fahrten', icon: TabIconFahrten },
    { href: '/dashboard/sell', label: 'Verkauf', icon: TabIconVerkauf },
    { href: '/dashboard/revenue', label: 'Umsatz', icon: TabIconUmsatz },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  };

  const roleLabel = (r: string) => {
    switch (r) {
      case 'driver': return 'Fahrer';
      case 'seller': return 'Verkauf';
      case 'admin': return 'Admin';
      default: return r;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <span className="font-semibold text-dark">{name}</span>
          <span className="text-sm text-gray-500 ml-2">({roleLabel(role)})</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-primary px-3 py-1.5 rounded-lg border border-gray-200"
        >
          Abmelden
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            >
              <tab.icon active={isActive} />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function TabIconFahrten({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#F24444' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TabIconVerkauf({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#F24444' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function TabIconUmsatz({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#F24444' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
