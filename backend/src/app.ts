import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import pool from './db/connection.js';
import { SessionOptions } from 'express-session';

// Import routes
import authRoutes from './routes/auth.routes.js';
import masterRoutes from './routes/master.routes.js';
import transactRoutes from './routes/transact.routes.js';

import { UserSession } from './types/index.js';

// Declare session augmentation for TypeScript
declare module 'express-session' {
  interface Session {
    user: UserSession;
  }
}

// Initialize environment variables
dotenv.config();

// Initialize session store
const MySQLStoreSession = MySQLStore(session);
const sessionStore = new MySQLStoreSession({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app: Express = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  name: 'inventory_session',
  secret: process.env.SESSION_SECRET || 'your_session_secret', // Move this to .env
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Inventory Management System API' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/master', masterRoutes);
app.use('/api/v1/transact', transactRoutes);

// Error handling middleware
interface ErrorWithMessage extends Error {
  status?: number;
}

app.use((err: ErrorWithMessage, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
    app.listen(PORT + 1, () => {
      console.log(`Server is running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

export default app;