import express, { Router } from 'express';
import { checkAuth, hasRole } from '../middleware/auth.js';
import { 
  AreaController,
  CustomerController,
  GSTController,
  ProductController,
  PricingController
} from '../controllers/master.controller.js';

const router: Router = express.Router();

// Apply authentication to all routes
router.use(checkAuth);
router.use(hasRole(['ROLE_OFFICE', 'ROLE_ADMIN']));

// Initialize controllers
const areaController = new AreaController();
const customerController = new CustomerController();
const gstController = new GSTController();
const productController = new ProductController();
const pricingController = new PricingController();

// Area Master Routes
router.get('/areas', areaController.getAll);
router.get('/areas/:id', areaController.getById);
router.post('/areas', areaController.create);
router.put('/areas/:id', areaController.update);
router.delete('/areas/:id', areaController.delete);

// Customer Master Routes
router.get('/customers', customerController.getAll);
router.get('/customers/:id', customerController.getById);
router.post('/customers', customerController.create);
router.put('/customers/:id', customerController.update);
router.delete('/customers/:id', customerController.delete);

// GST Master Routes
router.get('/gst', gstController.getAll);
router.get('/gst/:id', gstController.getById);
router.post('/gst', gstController.create);
router.put('/gst/:id', gstController.update);
router.delete('/gst/:id', gstController.delete);

// Product Master Routes
router.get('/products', productController.getAll);
router.get('/products/:id', productController.getById);
router.post('/products', productController.create);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.delete);

// Pricing Master Routes
router.get('/pricing', pricingController.getAll);
router.get('/pricing/:id', pricingController.getById);
router.post('/pricing', pricingController.create);
router.put('/pricing/:id', pricingController.update);
router.delete('/pricing/:id', pricingController.delete);

export default router;