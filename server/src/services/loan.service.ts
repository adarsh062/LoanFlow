const ANNUAL_RATE = 12;

export function calculateLoan(principal: number, tenureDays: number): {
  interestAmount: number;
  totalRepayment: number;
} {
  // Simple Interest: SI = (P * R * T) / (365 * 100)
  const interestAmount = parseFloat(
    ((principal * ANNUAL_RATE * tenureDays) / (365 * 100)).toFixed(2)
  );
  const totalRepayment = parseFloat((principal + interestAmount).toFixed(2));
  return { interestAmount, totalRepayment };
}

export function isValidTransition(current: string, next: string): boolean {
  const allowed: Record<string, string[]> = {
    PENDING: ['SANCTIONED', 'REJECTED'],
    SANCTIONED: ['DISBURSED'],
    DISBURSED: ['CLOSED'],
    REJECTED: [],
    CLOSED: [],
  };
  return (allowed[current] ?? []).includes(next);
}
