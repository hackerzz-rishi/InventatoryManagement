import express, { Router, Request, Response } from 'express';
import { checkAuth, hasRole } from '../middleware/auth.js';
import { UserSession } from '../types/index.js';

interface RequestWithUser extends Request {
  user?: UserSession;
}

const router: Router = express.Router();

// Apply authentication to all routes
router.use(checkAuth);

// Example master routes
router.get('/profile', hasRole(['ROLE_OFFICE', 'ROLE_SALES']), (req: RequestWithUser, res: Response) => {
  // User will be defined here because hasRole middleware ensures it
  res.json({ 
    status: 'success',
    data: { user: req.user }
  });
});

export default router;