import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import fundRoutes from './routes/fundRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import Account from './models/Fund.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'http://localhost:5173',           // Vite default port
  process.env.FRONTEND_URL || '',    // From .env file
  'https://family-funds-tracker.vercel.app'           // Fallback
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

// Routes
app.use('/api/funds', fundRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Initialize default accounts
const initializeAccounts = async () => {
  try {
    const existingAccounts = await Account.countDocuments();
    if (existingAccounts === 0) {
      await Account.insertMany([
        { name: 'Mummy', targetBalance: 200000, actualBalance: 200000 },
        { name: 'Vaibhav', targetBalance: 100000, actualBalance: 100000 }
      ]);
      console.log('Default accounts created');
    }
  } catch (error) {
    console.error('Error initializing accounts:', error.message);
  }
};

// Connect to MongoDB and start server
connectDB().then(async () => {
  await initializeAccounts();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});