'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/calculations';
import { Loan, User } from '@/types';

type LoanWithBorrower = Loan & { borrowerId: User };

export default function DisbursementPage() {
  const [loans, setLoans] = useState<LoanWithBorrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/disbursement/loans')
      .then(({ data }) => setLoans(data.data ?? []))
      .catch(() => toast.error('Failed to load loans'))
      .finally(() => setLoading(false));
  }, []);

  async function disburse(id: string) {
    setProcessing(id);
    try {
      await api.put(`/api/disbursement/loans/${id}/disburse`);
      toast.success('Loan disbursed');
      setLoans((prev) => prev.filter((l) => l._id !== id));
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Disbursement — Sanctioned Loans</h1>
          <p className="text-sm text-gray-500 mt-0.5">Loans approved by sanction team awaiting fund release.</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
          {loans.length} sanctioned
        </span>
      </div>

      <Card>
        <Table<LoanWithBorrower>
          data={loans}
          keyField="_id"
          emptyMessage="No sanctioned loans pending disbursement."
          columns={[
            { header: 'Borrower', render: (l) => <span className="font-medium text-gray-900">{l.borrowerId?.name ?? '—'}</span> },
            { header: 'Email', render: (l) => <span className="text-gray-500">{l.borrowerId?.email ?? '—'}</span> },
            { header: 'Principal', render: (l) => formatCurrency(l.principalAmount) },
            { header: 'Total Repayment', render: (l) => formatCurrency(l.totalRepayment) },
            { header: 'Sanctioned On', render: (l) => formatDate(l.sanctionedAt) },
            {
              header: 'Status',
              render: (l) => <Badge variant={statusBadgeVariant(l.status)}>{l.status}</Badge>,
            },
            {
              header: 'Action',
              render: (l) => (
                <Button
                  size="sm"
                  onClick={() => disburse(l._id)}
                  loading={processing === l._id}
                  disabled={!!processing}
                >
                  Mark Disbursed
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
