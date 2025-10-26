import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
// Import routes
import authRoutes from './routes/auth.routes.js';
import masterRoutes from './routes/master.routes.js';
import transactRoutes from './routes/transact.routes.js';
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
const app = express();
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
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Inventory Management System API' });
});
// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/master', masterRoutes);
app.use('/api/v1/transact', transactRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;
