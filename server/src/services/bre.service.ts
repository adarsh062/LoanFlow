import { EmploymentMode } from '../models/BorrowerProfile';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export interface BREResult {
  passed: boolean;
  errors: string[];
}

export function runBRE(params: {
  dob: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  pan: string;
}): BREResult {
  const errors: string[] = [];

  // Age check: must be between 23 and 50
  const today = new Date();
  let age = today.getFullYear() - params.dob.getFullYear();
  const monthDiff = today.getMonth() - params.dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < params.dob.getDate())) {
    age--;
  }

  if (age < 23) errors.push('Applicant must be at least 23 years old');
  if (age > 50) errors.push('Applicant must not be older than 50 years');

  if (params.monthlySalary < 25000) {
    errors.push('Monthly salary must be at least ₹25,000');
  }

  if (params.employmentMode === 'UNEMPLOYED') {
    errors.push('Unemployed applicants are not eligible for a loan');
  }

  if (!PAN_REGEX.test(params.pan)) {
    errors.push('Invalid PAN format (expected: AAAAA9999A)');
  }

  return { passed: errors.length === 0, errors };
}
