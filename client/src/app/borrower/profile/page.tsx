'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { BorrowerProfile } from '@/types';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)')
    .toUpperCase(),
  dob: z.string().min(1, 'Date of birth is required'),
  monthlySalary: z.string().min(1, 'Monthly salary is required').transform(Number),
  employmentMode: z.enum(['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED']),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [breRunning, setBreRunning] = useState(false);
  const [breErrors, setBreErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as never });

  useEffect(() => {
    api.get('/api/borrower/profile').then(({ data }) => {
      if (data.data) {
        const p: BorrowerProfile = data.data;
        setProfile(p);
        reset({
          fullName: p.fullName,
          pan: p.pan,
          dob: p.dob.split('T')[0],
          monthlySalary: p.monthlySalary,
          employmentMode: p.employmentMode,
        });
      }
    }).finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(values: FormValues) {
    setBreErrors([]);
    try {
      const { data } = await api.post('/api/borrower/profile', values);
      if (data.data) {
        setProfile(data.data);
      }

      // Immediately run BRE after saving profile
      setBreRunning(true);
      try {
        await api.post('/api/borrower/bre');
        
        // Update local state's breApproved to true
        setProfile(prev => prev ? { ...prev, breApproved: true } : null);
        toast.success('Profile saved & BRE validation passed! Redirecting...');
        
        router.push('/borrower/upload');
      } catch (breErr: unknown) {
        const resp = (breErr as { response?: { data?: { data?: { errors?: string[] }; message?: string } } })?.response?.data;
        setBreErrors(resp?.data?.errors ?? [resp?.message ?? 'BRE validation failed']);
        
        // Synchronize local state: BRE failed, so set breApproved to false
        setProfile(prev => prev ? { ...prev, breApproved: false } : null);
        toast.error('Profile saved, but BRE criteria check failed.');
      } finally {
        setBreRunning(false);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save profile';
      toast.error(msg);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Personal Details</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in your details. BRE validation runs automatically on save.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5 font-medium text-gray-900">
          <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">1</span>
          Profile & BRE
        </span>
        <span className="flex-1 h-px bg-gray-200" />
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">2</span>
          Upload
        </span>
        <span className="flex-1 h-px bg-gray-200" />
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">3</span>
          Apply
        </span>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-900">Applicant Information</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="profile-fullName"
                label="Full Name"
                placeholder="As per PAN card"
                {...register('fullName')}
                error={errors.fullName?.message}
              />
              <Input
                id="profile-pan"
                label="PAN Number"
                placeholder="ABCDE1234F"
                {...register('pan')}
                error={errors.pan?.message}
                className="uppercase"
              />
              <Input
                id="profile-dob"
                label="Date of Birth"
                type="date"
                {...register('dob')}
                error={errors.dob?.message}
              />
              <Input
                id="profile-salary"
                label="Monthly Salary (₹)"
                type="number"
                placeholder="50000"
                {...register('monthlySalary')}
                error={errors.monthlySalary?.message}
              />
              <div className="sm:col-span-2">
                <Select
                  id="profile-employment"
                  label="Employment Mode"
                  {...register('employmentMode')}
                  error={errors.employmentMode?.message}
                >
                  <option value="">Select employment mode</option>
                  <option value="SALARIED">Salaried</option>
                  <option value="SELF_EMPLOYED">Self Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                </Select>
              </div>
            </div>

            {/* BRE validation errors */}
            {breErrors.length > 0 && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-xs font-semibold text-red-800 mb-2">BRE Validation Failed</p>
                <ul className="space-y-1">
                  {breErrors.map((e) => (
                    <li key={e} className="text-xs text-red-700 flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profile?.breApproved && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-green-800">BRE validation passed. You can proceed to the next step.</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                loading={isSubmitting || breRunning}
              >
                {isSubmitting ? 'Saving...' : breRunning ? 'Running BRE...' : 'Save & Continue'}
              </Button>
              {profile?.breApproved && (
                <Button type="button" variant="secondary" onClick={() => router.push('/borrower/upload')}>
                  Skip to Upload
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
