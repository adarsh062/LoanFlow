import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import borrowerRoutes from './routes/borrower.routes';
import salesRoutes from './routes/sales.routes';
import sanctionRoutes from './routes/sanction.routes';
import disbursementRoutes from './routes/disbursement.routes';
import collectionRoutes from './routes/collection.routes';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sanction', sanctionRoutes);
app.use('/api/disbursement', disbursementRoutes);
app.use('/api/collection', collectionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
