'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/ui/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
    } else if (user.role !== 'BORROWER') {
      router.replace('/dashboard');
    }
  }, [mounted, user, router]);

  if (!mounted || !user || user.role !== 'BORROWER') return <PageLoader />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="borrower" />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-6 max-w-3xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
