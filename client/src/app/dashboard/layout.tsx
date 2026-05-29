'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';
import { UserRole } from '@/types';

const ALLOWED_ROLES: UserRole[] = ['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION'];

const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/dashboard/sales': ['SALES', 'ADMIN'],
  '/dashboard/sanction': ['SANCTION', 'ADMIN'],
  '/dashboard/disbursement': ['DISBURSEMENT', 'ADMIN'],
  '/dashboard/collection': ['COLLECTION', 'ADMIN'],
};

const roleDefaultPage: Record<UserRole, string> = {
  ADMIN: '/dashboard/sales',
  SALES: '/dashboard/sales',
  SANCTION: '/dashboard/sanction',
  DISBURSEMENT: '/dashboard/disbursement',
  COLLECTION: '/dashboard/collection',
  BORROWER: '/borrower/profile',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'BORROWER') {
      router.replace('/borrower/profile');
      return;
    }

    // Check specific sub-route permissions
    const matchingRoute = Object.keys(ROUTE_ROLES).find(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );
    if (matchingRoute) {
      const allowed = ROUTE_ROLES[matchingRoute];
      if (!allowed.includes(user.role)) {
        // Redirect to their own allowed default module instead of logging out
        router.replace(roleDefaultPage[user.role] ?? '/login');
      }
    }
  }, [mounted, user, pathname, router]);

  if (!mounted || !user || !ALLOWED_ROLES.includes(user.role)) return <PageLoader />;

  // Enforce same route guard during rendering to prevent showing unauthorized children
  const matchingRoute = Object.keys(ROUTE_ROLES).find(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (matchingRoute && !ROUTE_ROLES[matchingRoute].includes(user.role)) {
    return <PageLoader />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="dashboard" />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top header bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{user.role}</span>
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
