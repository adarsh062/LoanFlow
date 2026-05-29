'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/ui/Spinner';
import { UserRole } from '@/types';

const roleRedirect: Record<UserRole, string> = {
  ADMIN: '/dashboard/sales',
  SALES: '/dashboard/sales',
  SANCTION: '/dashboard/sanction',
  DISBURSEMENT: '/dashboard/disbursement',
  COLLECTION: '/dashboard/collection',
  BORROWER: '/borrower/profile',
};

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (user) {
      router.replace(roleRedirect[user.role] ?? '/login');
    } else {
      router.replace('/login');
    }
  }, [mounted, user, router]);

  return <PageLoader />;
}
