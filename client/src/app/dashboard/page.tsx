'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/ui/Spinner';
import { UserRole } from '@/types';

const roleDefaultPage: Partial<Record<UserRole, string>> = {
  ADMIN: '/dashboard/sales',
  SALES: '/dashboard/sales',
  SANCTION: '/dashboard/sanction',
  DISBURSEMENT: '/dashboard/disbursement',
  COLLECTION: '/dashboard/collection',
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      const target = roleDefaultPage[user.role] ?? '/login';
      router.replace(target);
    }
  }, [user, router]);

  return <PageLoader />;
}
