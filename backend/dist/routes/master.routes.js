import express from 'express';
import { checkAuth, hasRole } from '../middleware/auth.js';
const router = express.Router();
// Apply authentication to all routes
router.use(checkAuth);
// Example master routes
router.get('/profile', hasRole(['ROLE_OFFICE', 'ROLE_SALES']), (req, res) => {
    // User will be defined here because hasRole middleware ensures it
    res.json({
        status: 'success',
        data: { user: req.user }
    });
});
export default router;
