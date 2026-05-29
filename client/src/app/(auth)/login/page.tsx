'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { UserRole } from '@/types';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const roleRedirect: Record<UserRole, string> = {
  ADMIN: '/dashboard/sales',
  SALES: '/dashboard/sales',
  SANCTION: '/dashboard/sanction',
  DISBURSEMENT: '/dashboard/disbursement',
  COLLECTION: '/dashboard/collection',
  BORROWER: '/borrower/profile',
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const { data } = await api.post('/api/auth/login', values);
      if (data.success) {
        setAuth(data.data.user, data.data.token);
        toast.success('Welcome back!');
        router.push(roleRedirect[data.data.user.role as UserRole] ?? '/');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(msg);
    }
  }

  return (
    <Card className="shadow-lg border-gray-100 overflow-hidden">
      <div className="h-1 bg-gray-900 w-full" />
      <CardBody className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to manage your loans</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
            className="focus:ring-gray-900 focus:border-gray-900"
          />
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="login-password" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Password
              </label>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
              className="focus:ring-gray-900 focus:border-gray-900"
            />
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full py-2.5 mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition duration-200">
            Sign in
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6 pt-4 border-t border-gray-100">
          New borrower?{' '}
          <Link href="/signup" className="text-gray-950 font-semibold hover:text-gray-800 underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
