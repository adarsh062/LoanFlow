'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const { data } = await api.post('/api/auth/signup', values);
      if (data.success) {
        toast.success('Account created! Please sign in.');
        router.push('/login');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Signup failed';
      toast.error(msg);
    }
  }

  return (
    <Card className="shadow-lg border-gray-100 overflow-hidden">
      <div className="h-1 bg-gray-900 w-full" />
      <CardBody className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Get started with your custom loan application</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="signup-name"
            label="Full Name"
            placeholder="John Doe"
            {...register('name')}
            error={errors.name?.message}
            className="focus:ring-gray-900 focus:border-gray-900"
          />
          <Input
            id="signup-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
            className="focus:ring-gray-900 focus:border-gray-900"
          />
          <Input
            id="signup-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
            className="focus:ring-gray-900 focus:border-gray-900"
          />

          <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
            <span className="font-semibold text-gray-700 block mb-0.5">Password requirements:</span>
            Must be at least 8 characters, contain one uppercase letter and one number.
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full py-2.5 mt-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition duration-200">
            Create account
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6 pt-4 border-t border-gray-100">
          Already have an account?{' '}
          <Link href="/login" className="text-gray-950 font-semibold hover:text-gray-800 underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
