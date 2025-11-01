import { Request, Response } from 'express';
import { BaseController } from './base.controller.js';
import pool from '../db/connection.js';

interface StockCheckResult {
  product_id: number;
  product_name: string;
  stock_quantity: number;
}

async function checkStockAvailability(
  connection: any,
  productId: number,
  requiredQuantity: number
): Promise<StockCheckResult> {
  const [rows] = await connection.execute(
    'SELECT product_id, product_name, stock_quantity FROM product_master WHERE product_id = ?',
    [productId]
  );

  if (!rows || rows.length === 0) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const product = rows[0] as StockCheckResult;
  if (product.stock_quantity < requiredQuantity) {
    throw new Error(
      `Insufficient stock for product ${product.product_name}. Available: ${product.stock_quantity}, Required: ${requiredQuantity}`
    );
  }

  return product;
}

async function validateAndUpdateStock(
  connection: any,
  productId: number,
  quantity: number,
  isDecrease: boolean
): Promise<void> {
  const updateQuery = isDecrease
    ? 'UPDATE product_master SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?'
    : 'UPDATE product_master SET stock_quantity = stock_quantity + ? WHERE product_id = ?';
  
  const params = isDecrease
    ? [quantity, productId, quantity]
    : [quantity, productId];

  const [result] = await connection.execute(updateQuery, params);
  
  if (result.affectedRows === 0) {
    throw new Error(`Failed to update stock for product ID ${productId}`);
  }
}

export class SalesController extends BaseController {
  constructor() {
    super('sales', 'sales_id');
  }

  create = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create sales record
      const { details, ...salesData } = req.body;

      // Check stock availability for all products first
      for (const detail of details) {
        await checkStockAvailability(connection, detail.product_id, detail.quantity);
      }

      // Create the main sales record
      const [salesResult] = await connection.execute(
        'INSERT INTO sales SET ?',
        [salesData]
      );
      const salesId = (salesResult as any).insertId;

      // Create sales details and update stock
      for (const detail of details) {
        // Insert sales detail record
        await connection.execute(
          'INSERT INTO sales_details SET ?',
          { ...detail, sales_id: salesId }
        );

        // Update product stock with validation
        await validateAndUpdateStock(connection, detail.product_id, detail.quantity, true);
      }

      await connection.commit();

      res.status(201).json({
        status: 'success',
        message: 'Sales record created successfully',
        data: { salesId }
      });
    } catch (error: any) {
      await connection.rollback();
      console.error('Error creating sales record:', error);
      
      // Send more informative error messages to the client
      res.status(error.message?.includes('Insufficient stock') ? 400 : 500).json({
        status: 'error',
        message: error.message || 'Error creating sales record',
        code: error.code
      });
    } finally {
      connection.release();
    }
  };
}

export class PurchaseController extends BaseController {
  constructor() {
    super('purchase', 'purchase_id');
  }

  create = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create purchase record
      const { details, ...purchaseData } = req.body;

      // Create the main purchase record
      const [purchaseResult] = await connection.execute(
        'INSERT INTO purchase SET ?',
        [purchaseData]
      );
      const purchaseId = (purchaseResult as any).insertId;

      // Create purchase details and update stock
      for (const detail of details) {
        // Insert purchase detail record
        await connection.execute(
          'INSERT INTO purchase_details SET ?',
          { ...detail, purchase_id: purchaseId }
        );

        // Update product stock
        await validateAndUpdateStock(connection, detail.product_id, detail.quantity, false);
      }

      await connection.commit();

      res.status(201).json({
        status: 'success',
        message: 'Purchase record created successfully',
        data: { purchaseId }
      });
    } catch (error: any) {
      await connection.rollback();
      console.error('Error creating purchase record:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error creating purchase record',
        code: error.code
      });
    } finally {
      connection.release();
    }
  };
}

export class StockReconController extends BaseController {
  constructor() {
    super('stock_recon', 'recon_id');
  }

  create = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { product_id, current_quantity, actual_quantity, difference, ...reconData } = req.body;

      // Get current product stock
      const [rows] = await connection.execute(
        'SELECT product_id, product_name, stock_quantity FROM product_master WHERE product_id = ?',
        [product_id]
      ) as [StockCheckResult[], any];

      if (!rows || !rows.length) {
        throw new Error(`Product with ID ${product_id} not found`);
      }

      const product = rows[0];
      const calculatedDifference = actual_quantity - product.stock_quantity;

      // Create stock reconciliation record
      const [reconResult] = await connection.execute(
        'INSERT INTO stock_recon SET ?',
        [{
          ...reconData,
          product_id,
          current_quantity: product.stock_quantity,
          actual_quantity,
          difference: calculatedDifference
        }]
      );

      // Update product stock
      await connection.execute(
        'UPDATE product_master SET stock_quantity = ? WHERE product_id = ?',
        [actual_quantity, product_id]
      );

      await connection.commit();

      res.status(201).json({
        status: 'success',
        message: 'Stock reconciliation record created successfully',
        data: {
          reconId: (reconResult as any).insertId,
          stockDifference: calculatedDifference
        }
      });
    } catch (error: any) {
      await connection.rollback();
      console.error('Error creating stock reconciliation record:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error creating stock reconciliation record',
        code: error.code
      });
    } finally {
      connection.release();
    }
  };
}