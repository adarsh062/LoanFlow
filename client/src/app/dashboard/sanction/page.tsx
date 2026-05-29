'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/calculations';
import { Loan, User } from '@/types';

type LoanWithBorrower = Loan & { borrowerId: User };

export default function SanctionPage() {
  const [loans, setLoans] = useState<LoanWithBorrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; loanId: string }>({ open: false, loanId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  function fetchLoans() {
    api.get('/api/sanction/loans')
      .then(({ data }) => setLoans(data.data ?? []))
      .catch(() => toast.error('Failed to load loans'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchLoans(); }, []);

  async function approve(id: string) {
    setProcessing(id);
    try {
      await api.put(`/api/sanction/loans/${id}/approve`);
      toast.success('Loan sanctioned');
      setLoans((prev) => prev.filter((l) => l._id !== id));
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    } finally {
      setProcessing(null);
    }
  }

  async function reject() {
    if (!rejectReason.trim()) { toast.error('Reason is required'); return; }
    setProcessing(rejectModal.loanId);
    try {
      await api.put(`/api/sanction/loans/${rejectModal.loanId}/reject`, { reason: rejectReason });
      toast.success('Loan rejected');
      setLoans((prev) => prev.filter((l) => l._id !== rejectModal.loanId));
      setRejectModal({ open: false, loanId: '' });
      setRejectReason('');
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
          <h1 className="text-lg font-semibold text-gray-900">Sanction — Pending Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve or reject pending loan applications.</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
          {loans.length} pending
        </span>
      </div>

      <Card>
        <Table<LoanWithBorrower>
          data={loans}
          keyField="_id"
          emptyMessage="No pending applications."
          columns={[
            { header: 'Borrower', render: (l) => <span className="font-medium text-gray-900">{l.borrowerId?.name ?? '—'}</span> },
            { header: 'Email', render: (l) => <span className="text-gray-500">{l.borrowerId?.email ?? '—'}</span> },
            { header: 'Principal', render: (l) => formatCurrency(l.principalAmount) },
            { header: 'Tenure', render: (l) => `${l.tenureDays} days` },
            { header: 'Total Repayment', render: (l) => formatCurrency(l.totalRepayment) },
            { header: 'Applied On', render: (l) => formatDate(l.createdAt) },
            {
              header: 'Status',
              render: (l) => <Badge variant={statusBadgeVariant(l.status)}>{l.status}</Badge>,
            },
            {
              header: 'Actions',
              render: (l) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approve(l._id)}
                    loading={processing === l._id}
                    disabled={!!processing}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => { setRejectModal({ open: true, loanId: l._id }); setRejectReason(''); }}
                    disabled={!!processing}
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={rejectModal.open}
        title="Reject Loan Application"
        onClose={() => setRejectModal({ open: false, loanId: '' })}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reject-reason" className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setRejectModal({ open: false, loanId: '' })}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={reject} loading={!!processing}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
