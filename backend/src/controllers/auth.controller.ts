import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';

interface LoginBody {
  username: string;
  password: string;
}

interface RegisterBody {
  username: string;
  password: string;
  email: string;
  role_id: string;
}

// Allowed roles for registration
const ALLOWED_ROLES = ['ROLE_OFFICE', 'ROLE_SALES'];

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { username, password } = req.body;

  try {
    // Get user from database
    const [users] = await pool.execute(
      'SELECT u.user_id, u.username, u.password, r.role_id, r.role_name FROM user_master u JOIN role_master r ON u.role_id = r.role_id WHERE u.username = ? AND u.is_active = true',
      [username]
    ) as any[];

    const user = users[0];

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Store user in session
    if (req.session) {
      req.session.user = {
        id: user.user_id,
        username: user.username,
        role: user.role_id
      };
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role_id
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login'
    });
  }
};

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { username, password, email, role_id } = req.body;

  try {
    // Validate role
    if (!ALLOWED_ROLES.includes(role_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role selected. Only Office and Sales roles are allowed.'
      });
    }

    // Check if username already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM user_master WHERE username = ?',
      [username]
    ) as any[];

    if (existingUsers[0]) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user_id
    const userId = 'U' + Date.now().toString().slice(-8);

    // Insert new user
    await pool.execute(
      'INSERT INTO user_master (user_id, username, password, email, role_id) VALUES (?, ?, ?, ?, ?)',
      [userId, username, hashedPassword, email, role_id]
    );

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during registration'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Error during logout'
        });
      }
      res.clearCookie('inventory_session');
      res.json({
        status: 'success',
        message: 'Logged out successfully'
      });
    });
  } else {
    res.json({
      status: 'success',
      message: 'Already logged out'
    });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  if (req.session && req.session.user) {
    return res.json({
      status: 'success',
      data: {
        user: req.session.user
      }
    });
  }
  
  res.status(401).json({
    status: 'error',
    message: 'Not authenticated'
  });
};