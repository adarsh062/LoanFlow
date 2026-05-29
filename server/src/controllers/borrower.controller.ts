import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BorrowerProfile } from '../models/BorrowerProfile';
import { Loan } from '../models/Loan';
import { runBRE } from '../services/bre.service';
import { calculateLoan } from '../services/loan.service';
import path from 'path';

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const profile = await BorrowerProfile.findOne({ userId: req.user!.id });
  res.json({ success: true, data: profile });
}

export async function saveProfile(req: AuthRequest, res: Response): Promise<void> {
  const { fullName, pan, dob, monthlySalary, employmentMode } = req.body;

  if (!fullName || !pan || !dob || !monthlySalary || !employmentMode) {
    res.status(400).json({ success: false, message: 'All profile fields are required' });
    return;
  }

  // Upsert profile; reset breApproved when profile changes
  const profile = await BorrowerProfile.findOneAndUpdate(
    { userId: req.user!.id },
    { fullName, pan: pan.toUpperCase(), dob: new Date(dob), monthlySalary: Number(monthlySalary), employmentMode, breApproved: false },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: 'Profile saved', data: profile });
}

export async function runBRECheck(req: AuthRequest, res: Response): Promise<void> {
  const profile = await BorrowerProfile.findOne({ userId: req.user!.id });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found. Please complete your profile first.' });
    return;
  }

  const result = runBRE({
    dob: profile.dob,
    monthlySalary: profile.monthlySalary,
    employmentMode: profile.employmentMode,
    pan: profile.pan,
  });

  if (result.passed) {
    profile.breApproved = true;
    await profile.save();
    res.json({ success: true, message: 'BRE validation passed', data: { passed: true, errors: [] } });
  } else {
    res.status(422).json({ success: false, message: 'BRE validation failed', data: { passed: false, errors: result.errors } });
  }
}

export async function uploadSalarySlip(req: AuthRequest, res: Response): Promise<void> {
  const profile = await BorrowerProfile.findOne({ userId: req.user!.id });
  if (!profile || !profile.breApproved) {
    res.status(403).json({ success: false, message: 'BRE validation must be completed before uploading' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, message: 'Salary slip uploaded', data: { url: fileUrl } });
}

export async function applyLoan(req: AuthRequest, res: Response): Promise<void> {
  const profile = await BorrowerProfile.findOne({ userId: req.user!.id });
  if (!profile || !profile.breApproved) {
    res.status(403).json({ success: false, message: 'BRE validation must be completed before applying' });
    return;
  }

  const existingLoan = await Loan.findOne({ borrowerId: req.user!.id, status: { $in: ['PENDING', 'SANCTIONED', 'DISBURSED'] } });
  if (existingLoan) {
    res.status(409).json({ success: false, message: 'You already have an active loan application' });
    return;
  }

  const { principalAmount, tenureDays, salarySlipUrl } = req.body;

  if (!principalAmount || !tenureDays || !salarySlipUrl) {
    res.status(400).json({ success: false, message: 'Principal amount, tenure and salary slip URL are required' });
    return;
  }

  // Always recalculate on server — never trust client values
  const { interestAmount, totalRepayment } = calculateLoan(Number(principalAmount), Number(tenureDays));

  const loan = await Loan.create({
    borrowerId: req.user!.id,
    principalAmount: Number(principalAmount),
    tenureDays: Number(tenureDays),
    interestRate: 12,
    interestAmount,
    totalRepayment,
    outstandingBalance: totalRepayment,
    salarySlipUrl,
    status: 'PENDING',
  });

  res.status(201).json({ success: true, message: 'Loan application submitted', data: loan });
}

export async function getMyLoan(req: AuthRequest, res: Response): Promise<void> {
  const loan = await Loan.findOne({ borrowerId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: loan });
}
