'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Table } from '@/components/ui/Table';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/calculations';
import { User } from '@/types';

export default function SalesPage() {
  const [leads, setLeads] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/sales/leads')
      .then(({ data }) => setLeads(data.data ?? []))
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sales — Lead Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Borrowers who registered but have not yet applied for a loan.</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Card>
        <Table
          data={leads}
          keyField="_id"
          emptyMessage="No leads found. All registered borrowers have applied."
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Email', accessor: 'email' },
            {
              header: 'Status',
              render: () => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Not Applied
                </span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
