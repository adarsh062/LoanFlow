'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { calculateLoan, formatCurrency } from '@/lib/calculations';
import { Loan } from '@/types';

const MIN_PRINCIPAL = 10000;
const MAX_PRINCIPAL = 500000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;

function ApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slipUrlParam = searchParams.get('slipUrl') || '';

  const [checking, setChecking] = useState(true);
  const [existingLoan, setExistingLoan] = useState<Loan | null>(null);
  const [slipUrl, setSlipUrl] = useState(slipUrlParam);
  const [principal, setPrincipal] = useState(100000);
  const [tenure, setTenure] = useState(180);
  const [applying, setApplying] = useState(false);

  const { interestAmount, totalRepayment } = calculateLoan(principal, tenure);

  useEffect(() => {
    // Guard: BRE must pass, and fetch existing loan + last uploaded slip URL
    api.get('/api/borrower/profile').then(({ data }) => {
      if (!data.data || !data.data.breApproved) {
        toast.error('Please complete BRE validation before applying');
        router.replace('/borrower/profile');
        return;
      }
    }).catch(() => router.replace('/borrower/profile'));

    api.get('/api/borrower/loan').then(({ data }) => {
      if (data.data) setExistingLoan(data.data);
    }).finally(() => setChecking(false));
  }, [router]);

  async function handleApply() {
    if (!slipUrl) {
      toast.error('Please upload your salary slip first');
      router.push('/borrower/upload');
      return;
    }
    setApplying(true);
    try {
      const { data } = await api.post('/api/borrower/apply', {
        principalAmount: principal,
        tenureDays: tenure,
        salarySlipUrl: slipUrl,
      });
      toast.success('Loan application submitted!');
      setExistingLoan(data.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Application failed';
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  }

  if (checking) return <PageLoader />;

  if (existingLoan && ['PENDING', 'SANCTIONED', 'DISBURSED'].includes(existingLoan.status)) {
    const isDisbursed = existingLoan.status === 'DISBURSED';
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {isDisbursed ? 'Active Loan Account' : 'Loan Application Status'}
          </h1>
        </div>
        <Card>
          <CardBody>
            <div className="text-center py-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDisbursed ? 'bg-green-50' : 'bg-blue-50'}`}>
                {isDisbursed ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
              </div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                {isDisbursed ? 'Active Loan Disbursed' : 'Loan Application Submitted'}
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {isDisbursed
                  ? 'Your funds have been released. Please maintain timely repayments.'
                  : 'Your application is currently under review by our operations team.'}
              </p>
              <div className="grid grid-cols-2 gap-3 text-left max-w-xs mx-auto">
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-xs text-gray-500">Principal</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(existingLoan.principalAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-xs text-gray-500">Tenure</p>
                  <p className="text-sm font-semibold text-gray-900">{existingLoan.tenureDays} days</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-xs text-gray-500">Total Repayment</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(existingLoan.totalRepayment)}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-xs text-gray-500">Outstanding Balance</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(existingLoan.outstandingBalance ?? existingLoan.totalRepayment)}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {existingLoan && existingLoan.status === 'REJECTED' && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-xs font-semibold text-red-800 mb-1">Previous Application Rejected</p>
          <p className="text-xs text-red-700 leading-relaxed">
            Your previous loan application for {formatCurrency(existingLoan.principalAmount)} was rejected.
            {existingLoan.rejectionReason && ` Reason: ${existingLoan.rejectionReason}`}
          </p>
          <p className="text-xs text-red-800 mt-1.5 font-semibold">You are fully eligible to apply for a new loan below.</p>
        </div>
      )}

      {existingLoan && existingLoan.status === 'CLOSED' && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-xs font-semibold text-green-800 mb-1">Previous Loan Closed Successfully</p>
          <p className="text-xs text-green-700 leading-relaxed">
            Congratulations! Your previous loan has been fully repaid and successfully closed. You can now configure and apply for a new loan below.
          </p>
        </div>
      )}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Loan Configuration</h1>
        <p className="text-sm text-gray-500 mt-0.5">Use the sliders to configure your loan amount and tenure.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
          <span className="text-green-700 font-medium">Profile & BRE</span>
        </span>
        <span className="flex-1 h-px bg-green-300" />
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
          <span className="text-green-700 font-medium">Upload</span>
        </span>
        <span className="flex-1 h-px bg-gray-200" />
        <span className="flex items-center gap-1.5 font-medium text-gray-900">
          <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">3</span>
          Apply
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sliders */}
        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-gray-900">Loan Amount</h2></CardHeader>
          <CardBody>
            <p className="text-2xl font-bold text-gray-900 mb-4">{formatCurrency(principal)}</p>
            <input
              id="principal-slider"
              type="range"
              min={MIN_PRINCIPAL}
              max={MAX_PRINCIPAL}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-gray-900"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatCurrency(MIN_PRINCIPAL)}</span>
              <span>{formatCurrency(MAX_PRINCIPAL)}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-gray-900">Loan Tenure</h2></CardHeader>
          <CardBody>
            <p className="text-2xl font-bold text-gray-900 mb-4">{tenure} days</p>
            <input
              id="tenure-slider"
              type="range"
              min={MIN_TENURE}
              max={MAX_TENURE}
              step={10}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-gray-900"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{MIN_TENURE} days</span>
              <span>{MAX_TENURE} days</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Live Calculation Summary */}
      <Card>
        <CardHeader><h2 className="text-sm font-semibold text-gray-900">Repayment Summary</h2></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Principal</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(principal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Interest Rate</p>
              <p className="text-sm font-semibold text-gray-900">12% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Interest Amount</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(interestAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Repayment</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(totalRepayment)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Formula: SI = (P × 12 × T) / (365 × 100)</p>
        </CardBody>
      </Card>

      {!slipUrl && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-800">No salary slip URL found. <button onClick={() => router.push('/borrower/upload')} className="underline font-medium">Upload your salary slip</button> before applying.</p>
        </div>
      )}

      <Button onClick={handleApply} loading={applying} size="lg" disabled={!slipUrl}>
        Submit Loan Application
      </Button>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ApplyContent />
    </Suspense>
  );
}
