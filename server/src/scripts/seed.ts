import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';

const seedUsers = [
  { name: 'Admin User', email: 'admin@test.com', role: 'ADMIN' as const },
  { name: 'Sales Agent', email: 'sales@test.com', role: 'SALES' as const },
  { name: 'Sanction Officer', email: 'sanction@test.com', role: 'SANCTION' as const },
  { name: 'Disbursement Officer', email: 'disbursement@test.com', role: 'DISBURSEMENT' as const },
  { name: 'Collection Agent', email: 'collection@test.com', role: 'COLLECTION' as const },
  { name: 'Test Borrower', email: 'borrower@test.com', role: 'BORROWER' as const },
];

async function seed(): Promise<void> {
  await connectDB();
  console.log('Seeding users...');

  const password = await bcrypt.hash('Password@123', 10);

  for (const u of seedUsers) {
    await User.findOneAndUpdate(
      { email: u.email },
      { ...u, password },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${u.email} (${u.role})`);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
