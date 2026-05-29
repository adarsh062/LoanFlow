import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Name, email and password are required' });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: 'BORROWER' });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, secret, {
    expiresIn: '7d',
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
}
