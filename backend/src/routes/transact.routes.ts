import express, { Router, Request, Response, NextFunction } from 'express';
import { checkAuth, hasRole } from '../middleware/auth.js';
import { UserSession } from '../types/index.js';
import { SalesController, PurchaseController, StockReconController } from '../controllers/transaction.controller.js';
import { salesValidator, purchaseValidator, stockReconValidator } from '../validators/transaction.validator.js';
import { validationResult } from 'express-validator';

interface RequestWithUser extends Request {
  user?: UserSession;
}

const router: Router = express.Router();

// Initialize controllers
const salesController = new SalesController();
const purchaseController = new PurchaseController();
const stockReconController = new StockReconController();

// Validation error handler middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Request tracking middleware
const trackRequest = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} by ${req.user?.username || 'unknown'} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};

// Apply authentication and request tracking to all routes
router.use(checkAuth);
router.use(trackRequest);

// Sales routes
router.get('/sales', hasRole(['ROLE_OFFICE', 'ROLE_SALES']), salesController.getAll);
router.get('/sales/:id', hasRole(['ROLE_OFFICE', 'ROLE_SALES']), salesController.getById);
router.post('/sales', 
  hasRole(['ROLE_OFFICE', 'ROLE_SALES']), 
  salesValidator,
  handleValidationErrors,
  salesController.create
);
router.put('/sales/:id', 
  hasRole(['ROLE_OFFICE']), 
  salesValidator,
  handleValidationErrors,
  salesController.update
);
router.delete('/sales/:id', hasRole(['ROLE_OFFICE']), salesController.delete);

// Purchase routes
router.get('/purchase', hasRole(['ROLE_OFFICE']), purchaseController.getAll);
router.get('/purchase/:id', hasRole(['ROLE_OFFICE']), purchaseController.getById);
router.post('/purchase', 
  hasRole(['ROLE_OFFICE']), 
  purchaseValidator,
  handleValidationErrors,
  purchaseController.create
);
router.put('/purchase/:id', 
  hasRole(['ROLE_OFFICE']), 
  purchaseValidator,
  handleValidationErrors,
  purchaseController.update
);
router.delete('/purchase/:id', hasRole(['ROLE_OFFICE']), purchaseController.delete);

// Stock reconciliation routes
router.get('/stock-recon', hasRole(['ROLE_OFFICE']), stockReconController.getAll);
router.get('/stock-recon/:id', hasRole(['ROLE_OFFICE']), stockReconController.getById);
router.post('/stock-recon', 
  hasRole(['ROLE_OFFICE']), 
  stockReconValidator,
  handleValidationErrors,
  stockReconController.create
);
router.put('/stock-recon/:id', 
  hasRole(['ROLE_OFFICE']), 
  stockReconValidator,
  handleValidationErrors,
  stockReconController.update
);
router.delete('/stock-recon/:id', hasRole(['ROLE_OFFICE']), stockReconController.delete);

export default router;