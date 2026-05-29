const ANNUAL_RATE = 12;

export function calculateLoan(principal: number, tenureDays: number): {
  interestAmount: number;
  totalRepayment: number;
} {
  const interestAmount = parseFloat(
    ((principal * ANNUAL_RATE * tenureDays) / (365 * 100)).toFixed(2)
  );
  const totalRepayment = parseFloat((principal + interestAmount).toFixed(2));
  return { interestAmount, totalRepayment };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
