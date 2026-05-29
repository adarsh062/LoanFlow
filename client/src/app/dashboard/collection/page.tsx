'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/calculations';
import { Loan, User } from '@/types';

type LoanWithBorrower = Loan & { borrowerId: User };

const paymentSchema = z.object({
  utrNumber: z.string().min(1, 'UTR number is required'),
  amount: z.string().min(1, 'Amount is required').transform(Number),
  paymentDate: z.string().min(1, 'Payment date is required'),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function CollectionPage() {
  const [loans, setLoans] = useState<LoanWithBorrower[]>([]);
  const [completedLoans, setCompletedLoans] = useState<LoanWithBorrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithBorrower | null>(null);
  const user = useAuthStore((s) => s.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema) as never });

  function fetchLoans() {
    Promise.all([
      api.get('/api/collection/loans'),
      api.get('/api/collection/completed')
    ])
      .then(([activeRes, completedRes]) => {
        setLoans(activeRes.data.data ?? []);
        setCompletedLoans(completedRes.data.data ?? []);
      })
      .catch(() => toast.error('Failed to load collections data'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  async function onPaymentSubmit(values: PaymentFormValues) {
    if (!selectedLoan) return;

    if (values.amount > selectedLoan.outstandingBalance) {
      toast.error(`Amount exceeds outstanding balance (${formatCurrency(selectedLoan.outstandingBalance)})`);
      return;
    }

    try {
      const { data } = await api.post(`/api/collection/loans/${selectedLoan._id}/payment`, values);
      toast.success(data.message);

      // Reload both tables to move closed loans to completed log
      setLoading(true);
      fetchLoans();
      setSelectedLoan(null);
      reset();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Payment failed');
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Collection & Repayments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record repayments and view loan settlement history.</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
          {loans.length} active
        </span>
      </div>

      <Card>
        <Table<LoanWithBorrower>
          data={loans}
          keyField="_id"
          emptyMessage="No disbursed loans for collection."
          columns={[
            { header: 'Borrower', render: (l) => <span className="font-medium text-gray-900">{l.borrowerId?.name ?? '—'}</span> },
            { header: 'Principal', render: (l) => formatCurrency(l.principalAmount) },
            { header: 'Total Repayment', render: (l) => formatCurrency(l.totalRepayment) },
            {
              header: 'Outstanding',
              render: (l) => (
                <span className={l.outstandingBalance < l.totalRepayment * 0.3 ? 'text-green-700 font-semibold' : ''}>
                  {formatCurrency(l.outstandingBalance)}
                </span>
              ),
            },
            { header: 'Disbursed On', render: (l) => formatDate(l.disbursedAt) },
            {
              header: 'Status',
              render: (l) => <Badge variant={statusBadgeVariant(l.status)}>{l.status}</Badge>,
            },
            {
              header: 'Action',
              render: (l) => user?.role === 'COLLECTION' || user?.role === 'ADMIN' ? (
                <Button size="sm" variant="secondary" onClick={() => { setSelectedLoan(l); reset({ paymentDate: new Date().toISOString().split('T')[0] }); }}>
                  Record Payment
                </Button>
              ) : <span className="text-gray-400">—</span>,
            },
          ]}
        />
      </Card>

      {/* Completed & Closed Loans Section */}
      <div className="pt-6 border-t border-gray-200 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Completed & Closed Loans</h2>
            <p className="text-xs text-gray-500 mt-0.5">Log of all historical loans that have been fully repaid and settled.</p>
          </div>
          <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium border border-green-100">
            {completedLoans.length} closed
          </span>
        </div>

        <Card>
          <Table<LoanWithBorrower>
            data={completedLoans}
            keyField="_id"
            emptyMessage="No completed loans found."
            columns={[
              { header: 'Borrower', render: (l) => <span className="font-medium text-gray-900">{l.borrowerId?.name ?? '—'}</span> },
              { header: 'Email', render: (l) => <span className="text-gray-500">{l.borrowerId?.email ?? '—'}</span> },
              { header: 'Principal', render: (l) => formatCurrency(l.principalAmount) },
              { header: 'Total Repayment', render: (l) => formatCurrency(l.totalRepayment) },
              { header: 'Settled On', render: (l) => l.closedAt ? formatDate(l.closedAt) : '—' },
              {
                header: 'Status',
                render: () => <Badge variant="closed">CLOSED</Badge>,
              },
            ]}
          />
        </Card>
      </div>

      <Modal
        open={!!selectedLoan}
        title="Record Payment"
        onClose={() => { setSelectedLoan(null); reset(); }}
      >
        {selectedLoan && (
          <div className="space-y-4">
            {/* Outstanding balance info */}
            <div className="bg-gray-50 rounded-md p-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Borrower</p>
                <p className="text-sm font-semibold text-gray-900">{selectedLoan.borrowerId?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Outstanding Balance</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(selectedLoan.outstandingBalance)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onPaymentSubmit)} className="space-y-3">
              <Input
                id="utr-number"
                label="UTR Number"
                placeholder="HDFC0012345678"
                {...register('utrNumber')}
                error={errors.utrNumber?.message}
              />
              <Input
                id="payment-amount"
                label="Amount (₹)"
                type="number"
                step="0.01"
                placeholder="10000"
                {...register('amount')}
                error={errors.amount?.message}
              />
              <Input
                id="payment-date"
                label="Payment Date"
                type="date"
                {...register('paymentDate')}
                error={errors.paymentDate?.message}
              />
              <div className="flex gap-2 justify-end pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={() => { setSelectedLoan(null); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={isSubmitting}>
                  Record Payment
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
