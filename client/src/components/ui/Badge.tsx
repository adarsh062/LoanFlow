import React from 'react';

type BadgeVariant = 'pending' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed' | 'neutral';

const variantClasses: Record<BadgeVariant, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  sanctioned: 'bg-blue-50 text-blue-700 border border-blue-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  disbursed: 'bg-green-50 text-green-700 border border-green-200',
  closed: 'bg-gray-100 text-gray-600 border border-gray-200',
  neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export function statusBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    PENDING: 'pending',
    SANCTIONED: 'sanctioned',
    REJECTED: 'rejected',
    DISBURSED: 'disbursed',
    CLOSED: 'closed',
  };
  return map[status] ?? 'neutral';
}
