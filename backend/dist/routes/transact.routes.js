import express from 'express';
import { checkAuth, hasRole } from '../middleware/auth.js';
const router = express.Router();
// Apply authentication to all routes
router.use(checkAuth);
// Example transaction routes
router.get('/current', hasRole(['ROLE_OFFICE', 'ROLE_SALES']), (req, res) => {
    // User will be defined here because hasRole middleware ensures it
    res.json({
        status: 'success',
        data: {
            message: 'Transaction endpoint working',
            user: req.user
        }
    });
});
export default router;
