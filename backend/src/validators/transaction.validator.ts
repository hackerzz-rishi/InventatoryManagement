import { body } from 'express-validator';

export const salesValidator = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer is required')
    .isInt()
    .withMessage('Invalid customer ID'),
  body('invoice_number')
    .notEmpty()
    .withMessage('Invoice number is required')
    .trim(),
  body('invoice_date')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('gst_amount')
    .isFloat({ min: 0 })
    .withMessage('GST amount must be a positive number'),
  body('net_amount')
    .isFloat({ min: 0 })
    .withMessage('Net amount must be a positive number'),
  body('details')
    .isArray()
    .withMessage('Sale details are required')
    .notEmpty()
    .withMessage('At least one item is required'),
  body('details.*.product_id')
    .isInt()
    .withMessage('Invalid product ID'),
  body('details.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('details.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('details.*.gst_rate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST rate must be between 0 and 100'),
];

export const purchaseValidator = [
  body('supplier_id')
    .notEmpty()
    .withMessage('Supplier is required')
    .isInt()
    .withMessage('Invalid supplier ID'),
  body('invoice_number')
    .notEmpty()
    .withMessage('Invoice number is required')
    .trim(),
  body('invoice_date')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('gst_amount')
    .isFloat({ min: 0 })
    .withMessage('GST amount must be a positive number'),
  body('net_amount')
    .isFloat({ min: 0 })
    .withMessage('Net amount must be a positive number'),
  body('details')
    .isArray()
    .withMessage('Purchase details are required')
    .notEmpty()
    .withMessage('At least one item is required'),
  body('details.*.product_id')
    .isInt()
    .withMessage('Invalid product ID'),
  body('details.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('details.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('details.*.gst_rate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST rate must be between 0 and 100'),
];

export const stockReconValidator = [
  body('product_id')
    .notEmpty()
    .withMessage('Product is required')
    .isInt()
    .withMessage('Invalid product ID'),
  body('current_quantity')
    .isFloat({ min: 0 })
    .withMessage('Current quantity must be a positive number'),
  body('actual_quantity')
    .isFloat({ min: 0 })
    .withMessage('Actual quantity must be a positive number'),
  body('difference')
    .isFloat()
    .withMessage('Difference must be a number'),
  body('adjustment_reason')
    .notEmpty()
    .withMessage('Adjustment reason is required')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Adjustment reason too long'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes too long'),
];