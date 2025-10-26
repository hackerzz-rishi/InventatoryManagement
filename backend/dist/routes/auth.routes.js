import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateRegistration, validateLogin } from '../validators/auth.validator.js';
const router = express.Router();
// Authentication routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/check', authController.checkAuth);
export default router;
