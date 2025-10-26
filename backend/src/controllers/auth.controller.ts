import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Get user from database
    const [users] = await pool.execute(
      'SELECT u.user_id, u.username, u.password, r.role_name FROM user_master u JOIN role_master r ON u.role_id = r.role_id WHERE u.username = ?',
      [username]
    );

    const user = users[0];

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Store user in session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role_name
    };

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role_name
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

export const register = async (req: Request, res: Response) => {
  const { username, password, email, role_id } = req.body;

  try {
    // Check if username already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM user_master WHERE username = ?',
      [username]
    );

    if (existingUsers[0]) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user_id (you may want to implement your own logic)
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