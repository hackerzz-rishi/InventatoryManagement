import { Request, Response } from 'express';
import pool from '../db/connection.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class BaseController {
  protected tableName: string;
  protected primaryKey: string;

  constructor(tableName: string, primaryKey: string) {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
      res.json({
        status: 'success',
        data: rows
      });
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      res.status(500).json({
        status: 'error',
        message: `Error fetching ${this.tableName}`
      });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
        [req.params.id]
      );
      
      const result = rows as RowDataPacket[];
      if (result.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Record not found'
        });
      }

      res.json({
        status: 'success',
        data: result[0]
      });
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      res.status(500).json({
        status: 'error',
        message: `Error fetching ${this.tableName}`
      });
    }
  };

  protected generateId = async (prefix: string): Promise<string> => {
    const [[result]] = await pool.execute(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    ) as [RowDataPacket[], any];
    const count = (result as RowDataPacket).count;
    return `${prefix}${String(count + 1).padStart(5, '0')}`;
  };

  create = async (req: Request, res: Response) => {
    try {
      let id;
      // Generate appropriate ID based on table name
      switch (this.tableName) {
        case 'customer_master':
          id = await this.generateId('CUST');
          break;
        case 'product_master':
          id = await this.generateId('PROD');
          break;
        case 'area_master':
          id = await this.generateId('AREA');
          break;
        case 'gst_master':
          id = await this.generateId('GST');
          break;
        case 'pricing_master':
          id = await this.generateId('PRICE');
          break;
        default:
          throw new Error('Unknown table type');
      }

      const data = { ...req.body, [this.primaryKey]: id };
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map(() => '?').join(', ');

      const [result] = await pool.execute(
        `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
        values
      );

      const insertResult = result as ResultSetHeader;
      
      res.status(201).json({
        status: 'success',
        message: 'Record created successfully',
        data: { id: insertResult.insertId }
      });
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      res.status(500).json({
        status: 'error',
        message: `Error creating ${this.tableName}`
      });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const updates = Object.entries(req.body)
        .map(([key, _]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(req.body), req.params.id];

      const [result] = await pool.execute(
        `UPDATE ${this.tableName} SET ${updates} WHERE ${this.primaryKey} = ?`,
        values
      );

      const updateResult = result as ResultSetHeader;
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Record not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Record updated successfully'
      });
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      res.status(500).json({
        status: 'error',
        message: `Error updating ${this.tableName}`
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const [result] = await pool.execute(
        `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
        [req.params.id]
      );

      const deleteResult = result as ResultSetHeader;
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Record not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Record deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      res.status(500).json({
        status: 'error',
        message: `Error deleting ${this.tableName}`
      });
    }
  };
}